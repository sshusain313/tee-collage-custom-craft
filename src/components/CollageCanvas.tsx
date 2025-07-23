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
    <div className="space-y-6">
      {/* Mode Toggle Button */}
      
      {/* Grid Template Selector */}
      <GridSelector
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
      />

      {/* Export Toolbar */}
      {isGridVisible && (
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
      )}

      {/* Canvas Container */}
      <Card className="p-6 bg-gradient-card shadow-elegant">
        <div className="flex flex-col items-center space-y-4">
          <div className='flex w-full justify-end'>
          {/* <h3 className="text-lg font-semibold text-foreground">
            Create Your Photo Collage
          </h3> */}
        <div className='flex justify-end gap-20'>
        <h3 className='text-2xl flex-start font-semibold text-foreground mr-20'>
          Create Your Photo Collage
        </h3>
        <div className='flex gap-2'>
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
        </div>
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
          
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background/50">
            <canvas 
              ref={canvasRef} 
              className="border border-border rounded-lg shadow-sm"
            />
          </div>
        </div>
      </Card>

      {/* Instructions */}
      {isGridVisible && (
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
      )}
    </div>
  );
};
