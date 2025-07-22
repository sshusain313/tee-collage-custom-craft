
import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { GridSelector } from './GridSelector';
import { useGridTemplates, GridType, GridCell } from './GridTemplates';
import { useImageUploader } from './ImageUploader';

interface CollageCanvasProps {
  tshirtImage?: string;
}

export const CollageCanvas = ({ tshirtImage }: CollageCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [gridCells, setGridCells] = useState<GridCell[]>([]);
  const [selectedGrid, setSelectedGrid] = useState<GridType | null>(null);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);

  const { createHexagonalGrid, createSquareGrid, createCircularGrid, createCenterFocusGrid } = useGridTemplates();
  const { uploadImageToCell } = useImageUploader();

  const createGrid = useCallback((gridType: GridType) => {
    if (!fabricCanvas) return [];

    switch (gridType) {
      case 'hexagonal':
        return createHexagonalGrid(fabricCanvas);
      case 'square':
        return createSquareGrid(fabricCanvas);
      case 'circular':
        return createCircularGrid(fabricCanvas);
      case 'center-focus':
        return createCenterFocusGrid(fabricCanvas);
      default:
        return [];
    }
  }, [fabricCanvas, createHexagonalGrid, createSquareGrid, createCircularGrid, createCenterFocusGrid]);

  const showGrid = useCallback(() => {
    if (!fabricCanvas || !selectedGrid) return;

    // Clear existing grid
    gridCells.forEach(cell => {
      fabricCanvas.remove(cell.shape);
      if (cell.image) {
        fabricCanvas.remove(cell.image);
      }
    });

    const newCells = createGrid(selectedGrid);
    
    // Add click handlers and add to canvas
    newCells.forEach((cell, index) => {
      cell.shape.on('mousedown', () => {
        setSelectedCellIndex(index);
        uploadImageToCell(
          cell, 
          fabricCanvas, 
          (cellIndex: number, image: any) => {
            setGridCells(prev => {
              const updated = [...prev];
              if (updated[cellIndex]) {
                updated[cellIndex].image = image;
              }
              return updated;
            });
          }
        );
      });

      // Add hover effects
      cell.shape.on('mouseover', () => {
        cell.shape.set({ fill: 'rgba(200, 200, 200, 0.3)' });
        fabricCanvas.renderAll();
      });

      cell.shape.on('mouseout', () => {
        cell.shape.set({ fill: 'rgba(200, 200, 200, 0.1)' });
        fabricCanvas.renderAll();
      });

      fabricCanvas.add(cell.shape);
    });

    setGridCells(newCells);
    setIsGridVisible(true);
    fabricCanvas.renderAll();

    toast({
      title: "Grid Created!",
      description: `${selectedGrid} grid is ready. Click on cells to upload images.`,
    });
  }, [fabricCanvas, selectedGrid, gridCells, createGrid, uploadImageToCell]);

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
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Grid Template Selector */}
      <GridSelector
        selectedGrid={selectedGrid}
        onGridSelect={setSelectedGrid}
        onShowGrid={showGrid}
        onClearGrid={clearGrid}
        isGridVisible={isGridVisible}
      />

      {/* Export Toolbar */}
      {isGridVisible && (
        <Card className="p-4 bg-gradient-card">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Grid: {selectedGrid} • Cells: {gridCells.length}
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
          <h3 className="text-lg font-semibold text-foreground">
            Create Your Photo Collage
          </h3>
          
          {!isGridVisible ? (
            <p className="text-sm text-muted-foreground text-center">
              Select a grid template above and click "Show Grid" to start creating your collage.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Click on any grid cell to upload a photo. Each cell can hold one unique image.
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
              <span>Drag images to reposition within cells</span>
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
