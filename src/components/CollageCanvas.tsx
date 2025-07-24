import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GridSelector } from './GridSelector';
import { useGridTemplates, GridType, GridCell } from './GridTemplates';
import { useImageUploader } from './ImageUploader';
import { Polygon, Circle, Rect } from 'fabric';
import Layout from './Layout';
import { DesignSidebar } from './DesignSidebar';
import * as fabric from 'fabric';

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
  } else if (cell.type === 'center-focus') {
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
  } else if (cell.type === 'center-focus') {
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

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  cellIndex: number;
}

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
  const [contextMenu, setContextMenu] = useState<ContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    cellIndex: -1
  });

  // Add background state at the top of the component
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'pattern' | 'image'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundGradient, setBackgroundGradient] = useState({ id: 'sunset', name: 'Sunset', value: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)' });
  const [backgroundPattern, setBackgroundPattern] = useState({ id: 'dots', name: 'Dots', icon: null });
  const [backgroundOpacity, setBackgroundOpacity] = useState([100]);
  const [backgroundBlur, setBackgroundBlur] = useState([0]);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<string[]>([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<string>('');

  const { createHexagonalGrid, createSquareGrid, createCenterFocusGrid } = useGridTemplates();
  const { uploadImageToCell } = useImageUploader();

  const createGrid = useCallback((gridType: GridType) => {
    if (!fabricCanvas) return [];

    switch (gridType) {
      case 'hexagonal':
        return createHexagonalGrid(fabricCanvas);
      case 'square':
        return createSquareGrid(fabricCanvas);
      case 'center-focus':
        return createCenterFocusGrid(fabricCanvas, focusCount);
      default:
        return [];
    }
  }, [fabricCanvas, createHexagonalGrid, createSquareGrid, createCenterFocusGrid, focusCount]);

  // Helper to create a new cell based on existing cell
  const createCellFromTemplate = useCallback((templateCell: GridCell, offsetX: number = 0, offsetY: number = 0) => {
    const newShape = templateCell.shape.clone();
    newShape.set({
      left: templateCell.shape.left! + offsetX,
      top: templateCell.shape.top! + offsetY,
    });

    return {
      shape: newShape,
      image: templateCell.image ? templateCell.image.clone() : null,
      index: gridCells.length,
      centerX: templateCell.centerX + offsetX,
      centerY: templateCell.centerY + offsetY,
      size: templateCell.size,
      type: templateCell.type
    };
  }, [gridCells.length]);

  // Add new cell
  const addCell = useCallback((cellIndex: number) => {
    if (cellIndex < 0 || cellIndex >= gridCells.length) return;
    
    const templateCell = gridCells[cellIndex];
    const offset = 50; // Offset for new cell
    const newCell = createCellFromTemplate(templateCell, offset, offset);
    
    setGridCells(prev => [...prev, newCell]);
    
    if (fabricCanvas) {
      fabricCanvas.add(newCell.shape);
      if (newCell.image) {
        fitImageToCell(newCell.image, newCell);
        fabricCanvas.add(newCell.image);
      }
      fabricCanvas.renderAll();
    }

    toast({
      title: "Cell Added!",
      description: "A new cell has been added to your grid.",
    });
  }, [gridCells, createCellFromTemplate, fabricCanvas]);

  // Duplicate cell
  const duplicateCell = useCallback((cellIndex: number) => {
    if (cellIndex < 0 || cellIndex >= gridCells.length) return;
    
    const templateCell = gridCells[cellIndex];
    const offset = 30; // Smaller offset for duplicate
    const newCell = createCellFromTemplate(templateCell, offset, offset);
    
    setGridCells(prev => [...prev, newCell]);
    
    if (fabricCanvas) {
      fabricCanvas.add(newCell.shape);
      if (newCell.image) {
        fitImageToCell(newCell.image, newCell);
        fabricCanvas.add(newCell.image);
      }
      fabricCanvas.renderAll();
    }

    toast({
      title: "Cell Duplicated!",
      description: "The cell has been duplicated.",
    });
  }, [gridCells, createCellFromTemplate, fabricCanvas]);

  // Delete cell
  const deleteCell = useCallback((cellIndex: number) => {
    if (cellIndex < 0 || cellIndex >= gridCells.length) return;
    
    const cellToDelete = gridCells[cellIndex];
    
    if (fabricCanvas) {
      fabricCanvas.remove(cellToDelete.shape);
      if (cellToDelete.image) {
        fabricCanvas.remove(cellToDelete.image);
      }
    }
    
    setGridCells(prev => prev.filter((_, index) => index !== cellIndex));
    
    if (fabricCanvas) {
      fabricCanvas.renderAll();
    }

    toast({
      title: "Cell Deleted!",
      description: "The cell has been removed from your grid.",
    });
  }, [gridCells, fabricCanvas]);

  // Helper to update cell interactivity/event listeners based on mode
  const updateCellInteractivity = useCallback((cells: GridCell[], currentMode: Mode) => {
    cells.forEach((cell, index) => {
      // Remove all event listeners to avoid stacking
      if (cell.shape.off) {
        cell.shape.off('mousedown');
        cell.shape.off('moving');
        cell.shape.off('scaling');
        cell.shape.off('modified');
        cell.shape.off('rightclick');
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

        // Add right-click context menu
        cell.shape.on('mousedown', (e: any) => {
          if (e.e.button === 2) { // Right click
            e.e.preventDefault();
            const pointer = fabricCanvas!.getPointer(e.e);
            setContextMenu({
              visible: true,
              x: pointer.x,
              y: pointer.y,
              cellIndex: index
            });
          }
        });
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
    
    // Only preserve cell data if we're staying within the same template type
    // and only adjusting parameters (not switching between different templates)
    const prevGridType = gridCells.length > 0 ? gridCells[0].type : null;
    const isSameTemplateType = prevGridType === selectedGrid;
    
    if (isSameTemplateType) {
      // Transfer images and preserve geometry for the same template type
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
    }
    // If switching to a different template type, use the new cells as-is (default positions)
    
    setGridCells(newCells);
    setIsGridVisible(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas, selectedGrid, hexColumns, hexRows, squareRows, squareColumns, focusCount]);

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

  // Add useEffect to update the canvas background in real time
  useEffect(() => {
    if (!fabricCanvas) return;
    // Remove any previous background image object
    fabricCanvas.backgroundImage = null;
    // Remove any previous background pattern object (if you add one)
    // Set background color
    if (backgroundType === 'color') {
      fabricCanvas.backgroundColor = backgroundColor;
      fabricCanvas.renderAll();
    } else if (backgroundType === 'gradient') {
      // For gradients, create a rect with a gradient fill as the bottom-most object
      // (Fabric.js does not support CSS gradients as backgroundColor)
      // For now, fallback to backgroundColor
      fabricCanvas.backgroundColor = '#ffffff';
      fabricCanvas.renderAll();
      // TODO: Implement Fabric.js gradient background
    } else if (backgroundType === 'image' && selectedBackgroundImage) {
      (fabric.Image.fromURL as any)(selectedBackgroundImage, (img: any) => {
        img.set({
          scaleX: fabricCanvas.width / img.width,
          scaleY: fabricCanvas.height / img.height,
          opacity: backgroundOpacity[0] / 100,
          selectable: false,
          evented: false,
        });
        if (backgroundBlur[0] > 0) {
          img.filters = [new (fabric.Image as any).filters.Blur({ blur: backgroundBlur[0] / 20 })];
          img.applyFilters && img.applyFilters();
        }
        fabricCanvas.backgroundImage = img;
        fabricCanvas.renderAll();
      });
    } else {
      fabricCanvas.backgroundColor = '#ffffff';
      fabricCanvas.renderAll();
    }
    // Opacity and blur for color/gradient can be handled by overlaying a rect if needed
  }, [fabricCanvas, backgroundType, backgroundColor, backgroundGradient, backgroundPattern, backgroundOpacity, backgroundBlur, selectedBackgroundImage]);

  // Handle canvas right-click to close context menu
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const handleCanvasClick = () => {
      setContextMenu(prev => ({ ...prev, visible: false }));
    };
    
    fabricCanvas.on('mouse:down', handleCanvasClick);
    
    return () => {
      fabricCanvas.off('mouse:down', handleCanvasClick);
    };
  }, [fabricCanvas]);

  const clearGrid = useCallback(() => {
    if (!fabricCanvas) return;

    gridCells.forEach(cell => {
      fabricCanvas.remove(cell.shape);
      if (cell.image) {
        fabricCanvas.remove(cell.image);
      }
    });

    setGridCells([]);
    setIsGridVisible(false);
    setSelectedCellIndex(null);
    fabricCanvas.renderAll();

    toast({
      title: "Grid Cleared!",
      description: "All grid cells and images have been removed.",
    });
  }, [fabricCanvas, gridCells]);

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

  // Handler to select grid and reset parameters to defaults for each template
  const handleGridSelect = useCallback((gridType: GridType) => {
    setSelectedGrid(gridType);
    // Reset only the relevant parameters for each template to their defaults
    if (gridType === 'hexagonal') {
      // Hexagonal grid uses a fixed pattern (1 center + 6 surrounding), so no parameters to reset
      // But if you want to make it configurable, you could reset hexColumns and hexRows here
    } else if (gridType === 'square') {
      setSquareRows(4);
      setSquareColumns(4);
    } else if (gridType === 'center-focus') {
      setFocusCount(8);
    }
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 700,
      height: 700,
      backgroundColor: '#ffffff',
      selection: false,
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <Layout>
      <div className='flex flex-row gap-4 w-full'>
      {/* Grid Template Selector */}
      {/* <GridSelector
        selectedGrid={selectedGrid}
        onGridSelect={setSelectedGrid}
        onShowGrid={() => {
          // This function is now handled by the useEffect that calls showGrid
          // We just need to trigger the effect to regenerate the grid
        }}
        onClearGrid={clearGrid}
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
      /> */}
        <div className='w-1/4'>
        <DesignSidebar
          selectedGrid={selectedGrid}
          onGridSelect={handleGridSelect}
          onShowGrid={() => {}}
          onClearGrid={clearGrid}
          isGridVisible={isGridVisible}
          hexColumns={hexColumns}
          hexRows={hexRows}
          squareRows={squareRows}
          squareColumns={squareColumns}
          focusCount={focusCount}
          onHexColumnsChange={setHexColumns}
          onHexRowsChange={setHexRows}
          onSquareRowsChange={setSquareRows}
          onSquareColumnsChange={setSquareColumns}
          onFocusCountChange={setFocusCount}
          fabricCanvas={fabricCanvas}
        />
        </div>

    <div className="w-3/4">
      {/* Mode Toggle Button */}
      
      

      {/* Export Toolbar */}
      {/* {isGridVisible && (
        <Card className="p-4 bg-gradient-card">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Grid: {selectedGrid} • Cells: {gridCells.length}
              {selectedGrid === 'hexagonal' && (
                <span className="ml-2">• Columns: {hexColumns}</span>
              )}
              {selectedCellIndex !== null && (
                <span className="ml-2 text-primary font-medium">
                  Selected: Cell {selectedCellIndex + 1}
                </span>
              )}
            </div>
            <Button variant="hero" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Design
            </Button>
          </div>
        </Card>
      )} */}

      {/* Canvas Container */}
      <Card className="p-6 bg-gradient-card shadow-elegant">
        <div className="flex flex-col items-center space-y-4">
        <div className='flex justify-end gap-2 w-full'>
        <Button
          variant={mode === 'upload' ? 'default' : 'outline'}
          size="sm"
          className="mr-2"
          onClick={() => setMode('upload')}
        >
          Image Upload Mode
        </Button>
        <Button
          variant={mode === 'adjust' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('adjust')}
        >
          Grid Adjustment Mode
        </Button>
        </div>
        <div className='flex w-full justify-center'> 
        <h3 className='text-2xl flex-start font-semibold text-foreground mr-25'>
          Create Your Photo Collage
        </h3> 
        </div>
          
          {!isGridVisible ? (
            <p className="text-sm text-muted-foreground text-center">
              Select a grid template above and click "Show Grid" to start creating your collage.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Click on any grid cell to upload a photo. Each image will be perfectly fitted to its shape.
            </p>
          )}
          
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background/50 relative">
            <canvas 
              ref={canvasRef} 
              className="border border-border rounded-lg shadow-sm"
            />
            
            {/* Context Menu */}
            {contextMenu.visible && mode === 'adjust' && (
              <div 
                className="absolute bg-background border border-border rounded-lg shadow-lg z-50 min-w-[150px]"
                style={{ 
                  left: contextMenu.x, 
                  top: contextMenu.y 
                }}
              >
                <div className="p-1">
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                    onClick={() => {
                      addCell(contextMenu.cellIndex);
                      setContextMenu(prev => ({ ...prev, visible: false }));
                    }}
                  >
                    Add Cell
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm"
                    onClick={() => {
                      duplicateCell(contextMenu.cellIndex);
                      setContextMenu(prev => ({ ...prev, visible: false }));
                    }}
                  >
                    Duplicate Cell
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-sm text-destructive"
                    onClick={() => {
                      deleteCell(contextMenu.cellIndex);
                      setContextMenu(prev => ({ ...prev, visible: false }));
                    }}
                  >
                    Delete Cell
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Instructions */}
      {/* {isGridVisible && (
        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              <span>Click cells to upload individual photos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              <span>Images automatically fit cell shapes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full"></span>
              <span>Export when your design is complete</span>
            </div>
          </div>
        </Card>
      )} */}
    </div>
    </div>
    </Layout>
  );
};
