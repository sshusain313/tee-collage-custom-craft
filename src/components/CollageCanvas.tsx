import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CollageSidebar } from './CollageSidebar';
import { useGridTemplates, GridType, GridCell } from './GridTemplates';
import { useImageUploader } from './ImageUploader';
import { Polygon, Circle, Rect } from 'fabric';

interface CollageCanvasProps {
  tshirtImage?: string;
}

// Helper to fit an image to a cell's current geometry
export function fitImageToCell(img: any, cell: GridCell) {
  // Create clip path based on cell type and current geometry
  let clipPath;
  const cellCenter = cell.shape.getCenterPoint();
  const cellWidth = cell.shape.getScaledWidth();
  const cellHeight = cell.shape.getScaledHeight();

  if (cell.type === 'hexagonal') {
    const points = [];
    const hexSize = cellWidth / 2; // Use actual cell width
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push({
        x: hexSize * Math.cos(angle),
        y: hexSize * Math.sin(angle)
      });
    }
    clipPath = new Polygon(points, {
      left: cellCenter.x,
      top: cellCenter.y,
      originX: 'center',
      originY: 'center',
      absolutePositioned: true
    });
  } else if (cell.type === 'circular' || cell.type === 'center-focus') {
    clipPath = new Circle({
      radius: cellWidth / 2,
      left: cellCenter.x,
      top: cellCenter.y,
      originX: 'center',
      originY: 'center',
      absolutePositioned: true
    });
  } else {
    clipPath = new Rect({
      width: cellWidth,
      height: cellHeight,
      left: cellCenter.x,
      top: cellCenter.y,
      originX: 'center',
      originY: 'center',
      absolutePositioned: true
    });
  }

  // Calculate scale based on cell type
  let scale;
  if (cell.type === 'hexagonal') {
    scale = Math.max(
      (cellWidth * 1.2) / img.width,
      (cellHeight * 1.2) / img.height
    );
  } else if (cell.type === 'circular' || cell.type === 'center-focus') {
    scale = Math.max(
      cellWidth / img.width,
      cellHeight / img.height
    ) * 1.2;
  } else {
    scale = Math.max(
      cellWidth / img.width,
      cellHeight / img.height
    ) * 1.2;
  }

  // Apply settings
  img.set({
    left: cellCenter.x,
    top: cellCenter.y,
    originX: 'center',
    originY: 'center',
    clipPath: clipPath,
    scaleX: scale,
    scaleY: scale,
    selectable: false,
    hasControls: false,
    hasBorders: false,
    evented: false,
    hoverCursor: 'pointer',
    lockRotation: true,
    lockScalingFlip: true,
    lockSkewingX: true,
    lockSkewingY: true,
    lockRotationControl: true,
    centeredScaling: true,
    centeredRotation: true,
  });

  if (img.setControlsVisibility) {
    img.setControlsVisibility({ mtr: false });
  }
}

type Mode = 'upload' | 'adjust';

export const CollageCanvas = ({ tshirtImage }: CollageCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [selectedGrid, setSelectedGrid] = useState<GridType | null>(null);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [hexColumns, setHexColumns] = useState(8);
  const [hexRows, setHexRows] = useState(8);
  const [squareRows, setSquareRows] = useState(4);
  const [squareColumns, setSquareColumns] = useState(4);
  const [circleCount, setCircleCount] = useState(12);
  const [focusCount, setFocusCount] = useState(8);
  const [mode, setMode] = useState<Mode>('upload');
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showNames, setShowNames] = useState(true);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);

  const { createHexagonalGrid, createSquareGrid, createCircularGrid, createCenterFocusGrid } = useGridTemplates();
  const { uploadImageToCell } = useImageUploader();

  const createGrid = useCallback((gridType: GridType) => {
    if (!fabricCanvas) return [];

    switch (gridType) {
      case 'hexagonal':
        return createHexagonalGrid(fabricCanvas, hexColumns, hexRows);
      case 'square':
        return createSquareGrid(fabricCanvas, squareRows, squareColumns);
      case 'circular':
        return createCircularGrid(fabricCanvas, circleCount);
      case 'center-focus':
        return createCenterFocusGrid(fabricCanvas, focusCount);
      default:
        return [];
    }
  }, [fabricCanvas, createHexagonalGrid, createSquareGrid, createCircularGrid, createCenterFocusGrid, hexColumns, hexRows, squareRows, squareColumns, circleCount, focusCount]);

  // Helper to update cell interactivity/event listeners based on mode
  const updateCellInteractivity = useCallback((cells: GridCell[], currentMode: Mode) => {
    cells.forEach((cell, index) => {
      // Remove all event listeners to avoid stacking
      if (cell.shape.off) {
        cell.shape.off('mousedown');
        cell.shape.off('moving');
        cell.shape.off('scaling');
        cell.shape.off('modified');
      }

      // Setup event listeners and properties based on mode
      const setupAdjustMode = () => {
        cell.shape.set({
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          lockRotation: true,
          lockScalingFlip: true,
          lockSkewingX: true,
          lockSkewingY: true,
          lockRotationControl: true,
        });
        if (cell.shape.setControlsVisibility) {
          cell.shape.setControlsVisibility({ mtr: false });
        }

        // Add real-time update listeners for adjustment mode
        if (cell.image) {
          const updateImagePosition = () => {
            if (cell.image && fabricCanvas) {
              fitImageToCell(cell.image, cell);
              fabricCanvas.renderAll();
            }
          };

          cell.shape.on('moving', updateImagePosition);
          cell.shape.on('scaling', updateImagePosition);
          cell.shape.on('modified', updateImagePosition);
        }
      };

      const setupUploadMode = () => {
        cell.shape.set({
          selectable: false,
          evented: true,
          hasControls: false,
          hasBorders: false,
          lockRotation: true,
          lockScalingFlip: true,
          lockSkewingX: true,
          lockSkewingY: true,
          lockRotationControl: true,
        });
        if (cell.shape.setControlsVisibility) {
          cell.shape.setControlsVisibility({ mtr: false });
        }
        cell.shape.on('mousedown', () => {
          setSelectedCellIndex(index);
          uploadImageToCell(
            cell, 
            fabricCanvas, 
            (cellIndex: number, image: any) => {
              setGridCells(prev => {
                const updated = [...prev];
                const targetCellIndex = updated.findIndex(c => c.index === cellIndex);
                if (targetCellIndex !== -1) {
                  updated[targetCellIndex].image = image;
                  // Add movement/scaling listeners if in adjust mode
                  if (currentMode === 'adjust') {
                    const updateImagePosition = () => {
                      if (image && fabricCanvas) {
                        fitImageToCell(image, updated[targetCellIndex]);
                        fabricCanvas.renderAll();
                      }
                    };
                    updated[targetCellIndex].shape.on('moving', updateImagePosition);
                    updated[targetCellIndex].shape.on('scaling', updateImagePosition);
                    updated[targetCellIndex].shape.on('modified', updateImagePosition);
                  }
                }
                return updated;
              });
            }
          );
        });
      };

      // Apply mode-specific setup
      if (currentMode === 'adjust') {
        setupAdjustMode();
      } else {
        setupUploadMode();
      }
    });
  }, [fabricCanvas, uploadImageToCell]);

  // Only regenerate gridCells when grid type or parameters change
  useEffect(() => {
    if (!fabricCanvas || !selectedGrid) return;
    // Generate new gridCells for the selected grid type/params
    const newCells = createGrid(selectedGrid);
    // Transfer images and preserve geometry if possible
    newCells.forEach((cell) => {
      const prevCell = gridCells.find(c => c.index === cell.index);
      if (prevCell) {
        // If the user has moved/resized, preserve those values
        cell.shape.set({
          left: prevCell.shape.left,
          top: prevCell.shape.top,
          scaleX: prevCell.shape.scaleX,
          scaleY: prevCell.shape.scaleY,
          width: prevCell.shape.width,
          height: prevCell.shape.height,
        });
        cell.centerX = prevCell.centerX;
        cell.centerY = prevCell.centerY;
        cell.size = prevCell.size;
        cell.image = prevCell.image;
      }
    });
    setGridCells(newCells);
    setIsGridVisible(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas, selectedGrid, hexColumns, hexRows, squareRows, squareColumns, circleCount, focusCount]);

  // On mode switch or gridCells change, update interactivity/event listeners and re-render
  useEffect(() => {
    if (!fabricCanvas || !isGridVisible) return;
    fabricCanvas.clear();
    updateCellInteractivity(gridCells, mode);
    gridCells.forEach((cell) => {
      fabricCanvas.add(cell.shape);
      if (cell.image) {
        fitImageToCell(cell.image, cell);
        fabricCanvas.add(cell.image);
      }
    });
    fabricCanvas.renderAll();
  }, [mode, gridCells, fabricCanvas, isGridVisible, updateCellInteractivity]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      // Restore previous state logic here
      toast({
        title: "Undone!",
        description: "Last action has been undone.",
      });
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      // Restore next state logic here
      toast({
        title: "Redone!",
        description: "Action has been redone.",
      });
    }
  }, [historyIndex, history.length]);

  const handleReset = useCallback(() => {
    if (!fabricCanvas) return;
    
    // Clear all images but keep grid structure
    gridCells.forEach(cell => {
      if (cell.image) {
        fabricCanvas.remove(cell.image);
        cell.image = null;
      }
    });
    
    setGridCells([...gridCells]);
    fabricCanvas.renderAll();
    
    toast({
      title: "Layout Reset!",
      description: "All photos have been cleared from the grid.",
    });
  }, [fabricCanvas, gridCells]);

  const handleShuffle = useCallback(() => {
    if (!fabricCanvas) return;
    
    // Get all images and shuffle them
    const images = gridCells.map(cell => cell.image).filter(Boolean);
    const shuffled = [...images].sort(() => Math.random() - 0.5);
    
    // Reassign shuffled images to cells
    let imageIndex = 0;
    const newCells = gridCells.map(cell => ({
      ...cell,
      image: cell.image ? shuffled[imageIndex++] : null
    }));
    
    setGridCells(newCells);
    fabricCanvas.renderAll();
    
    toast({
      title: "Faces Shuffled!",
      description: "Photos have been randomly rearranged.",
    });
  }, [fabricCanvas, gridCells]);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(canvasZoom * 1.2, 3);
    setCanvasZoom(newZoom);
    if (fabricCanvas) {
      fabricCanvas.setZoom(newZoom);
      fabricCanvas.renderAll();
    }
  }, [canvasZoom, fabricCanvas]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(canvasZoom / 1.2, 0.5);
    setCanvasZoom(newZoom);
    if (fabricCanvas) {
      fabricCanvas.setZoom(newZoom);
      fabricCanvas.renderAll();
    }
  }, [canvasZoom, fabricCanvas]);

  const handleToggleNames = useCallback(() => {
    setShowNames(!showNames);
    toast({
      title: showNames ? "Names Hidden" : "Names Shown",
      description: `Names are now ${showNames ? "hidden" : "visible"}.`,
    });
  }, [showNames]);

  const handleToggleGuidelines = useCallback(() => {
    setShowGuidelines(!showGuidelines);
    toast({
      title: showGuidelines ? "Guidelines Hidden" : "Guidelines Shown",
      description: `Guidelines are now ${showGuidelines ? "hidden" : "visible"}.`,
    });
  }, [showGuidelines]);

  const handleExport = useCallback(() => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 3,
    });

    const link = document.createElement('a');
    link.download = 'collage-design.png';
    link.href = dataURL;
    link.click();

    toast({
      title: "Design Exported!",
      description: "Your collage has been downloaded in high resolution.",
    });
  }, [fabricCanvas]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: '#ffffff',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <CollageSidebar
        selectedGrid={selectedGrid}
        onGridSelect={setSelectedGrid}
        onShowGrid={() => {}}
        onClearGrid={() => {
          gridCells.forEach(cell => {
            if (fabricCanvas) {
              fabricCanvas.remove(cell.shape);
              if (cell.image) {
                fabricCanvas.remove(cell.image);
              }
            }
          });
          setGridCells([]);
          setIsGridVisible(false);
          setSelectedCellIndex(null);
          fabricCanvas?.renderAll();
          toast({
            title: "Grid Cleared!",
            description: "All grid cells and images have been removed.",
          });
        }}
        isGridVisible={isGridVisible}
        hexColumns={hexColumns}
        hexRows={hexRows}
        squareRows={squareRows}
        squareColumns={squareColumns}
        circleCount={circleCount}
        focusCount={focusCount}
        onHexColumnsChange={setHexColumns}
        onHexRowsChange={setHexRows}
        onSquareRowsChange={setSquareRows}
        onSquareColumnsChange={setSquareColumns}
        onCircleCountChange={setCircleCount}
        onFocusCountChange={setFocusCount}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        onShuffle={handleShuffle}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onToggleNames={handleToggleNames}
        onToggleGuidelines={handleToggleGuidelines}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        showNames={showNames}
        showGuidelines={showGuidelines}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-card">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Create Your Photo Collage</h1>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('upload')}
                >
                  Upload Mode
                </Button>
                <Button
                  variant={mode === 'adjust' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMode('adjust')}
                >
                  Adjust Mode
                </Button>
              </div>
            </div>
            
            {isGridVisible && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Grid: {selectedGrid} • Cells: {gridCells.length}
                  {selectedCellIndex !== null && (
                    <span className="ml-2 text-primary font-medium">
                      Selected: Cell {selectedCellIndex + 1}
                    </span>
                  )}
                </div>
                <Button variant="hero" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Design
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col items-center space-y-4 h-full">
            {!isGridVisible ? (
              <div className="flex-1 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                  <h3 className="text-lg font-semibold mb-2">Ready to Start?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select a grid template from the sidebar and start creating your collage.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Each image will be perfectly fitted to its shape.
                  </p>
                </Card>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background/50">
                <canvas 
                  ref={canvasRef} 
                  className="border border-border rounded-lg shadow-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Instructions Footer */}
        {isGridVisible && (
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <span>Click cells to upload individual photos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full"></span>
                <span>Use sidebar tools to customize your design</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full"></span>
                <span>Export when your design is complete</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
