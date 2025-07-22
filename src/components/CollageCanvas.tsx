import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, FabricImage, Polygon } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, RotateCw, Move, Grid } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CollageCanvasProps {
  tshirtImage?: string;
}

export const CollageCanvas = ({ tshirtImage }: CollageCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [gridCells, setGridCells] = useState<any[]>([]);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [isGridVisible, setIsGridVisible] = useState(true);

  // Create hexagonal grid pattern
  const createHexagonalGrid = useCallback(() => {
    if (!fabricCanvas) return;

    const canvasWidth = fabricCanvas.width!;
    const canvasHeight = fabricCanvas.height!;
    
    const hexSize = 60;
    const cols = 7;
    const rows = 8;
    
    const startX = (canvasWidth - cols * hexSize * 1.5) / 2;
    const startY = (canvasHeight - rows * hexSize * Math.sqrt(3)) / 2;

    const cells: any[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * hexSize * 1.5;
        const y = startY + row * hexSize * Math.sqrt(3) / 2 + (col % 2) * hexSize * Math.sqrt(3) / 4;

        // Create hexagon points
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          points.push({
            x: x + hexSize * Math.cos(angle),
            y: y + hexSize * Math.sin(angle)
          });
        }

        const hexagon = new Polygon(points, {
          fill: 'rgba(200, 200, 200, 0.3)',
          stroke: 'hsl(280, 100%, 60%)',
          strokeWidth: 2,
          selectable: true,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer',
        });

        // Add click handler for image upload
        hexagon.on('mousedown', () => {
          const cellIndex = cells.length;
          setSelectedCellIndex(cellIndex);
          
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                addImageToHexagon(hexagon, imageUrl, cellIndex);
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        });

        fabricCanvas.add(hexagon);
        cells.push({ 
          hexagon, 
          image: null, 
          index: cells.length,
          centerX: x,
          centerY: y,
          size: hexSize
        });
      }
    }

    setGridCells(cells);
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  const addImageToHexagon = useCallback((hexagon: any, imageUrl: string, cellIndex: number) => {
    if (!fabricCanvas) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      const hexBounds = hexagon.getBoundingRect();
      const scale = Math.min(hexBounds.width / img.width!, hexBounds.height / img.height!) * 1.2;
      
      img.scale(scale);
      img.set({
        left: hexBounds.left + hexBounds.width / 2,
        top: hexBounds.top + hexBounds.height / 2,
        originX: 'center',
        originY: 'center',
        clipPath: hexagon,
        selectable: true,
      });

      // Remove previous image if exists
      const cell = gridCells[cellIndex];
      if (cell?.image) {
        fabricCanvas.remove(cell.image);
      }

      fabricCanvas.add(img);
      fabricCanvas.renderAll();

      // Update cell data
      setGridCells(prev => {
        const newCells = [...prev];
        if (newCells[cellIndex]) {
          newCells[cellIndex].image = img;
        }
        return newCells;
      });

      toast({
        title: "Image Added!",
        description: "Your photo has been added to the collage.",
      });
    });
  }, [fabricCanvas, gridCells]);

  const handleExport = useCallback(() => {
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 3, // High resolution for printing
    });

    const link = document.createElement('a');
    link.download = 'tee-collage-design.png';
    link.href = dataURL;
    link.click();

    toast({
      title: "Design Exported!",
      description: "Your collage has been downloaded in high resolution.",
    });
  }, [fabricCanvas]);

  const clearCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    setGridCells([]);
    setSelectedCellIndex(null);
    createHexagonalGrid();
    toast({
      title: "Canvas Cleared!",
      description: "All images have been removed from the collage.",
    });
  }, [fabricCanvas, createHexagonalGrid]);

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

  useEffect(() => {
    if (fabricCanvas) {
      createHexagonalGrid();
    }
  }, [fabricCanvas, createHexagonalGrid]);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card className="p-4 bg-gradient-card">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="creative" 
              size="sm"
              onClick={() => setIsGridVisible(!isGridVisible)}
            >
              <Grid className="w-4 h-4" />
              {isGridVisible ? 'Hide Grid' : 'Show Grid'}
            </Button>
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              Clear All
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Design
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas Container */}
      <Card className="p-6 bg-gradient-card shadow-elegant">
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Create Your Hexagonal Photo Collage
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Click on any hexagon to upload a photo. Build your unique collage design!
          </p>
          
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background/50">
            <canvas 
              ref={canvasRef} 
              className="border border-border rounded-lg shadow-sm"
            />
          </div>

          {selectedCellIndex !== null && (
            <div className="text-sm text-primary font-medium animate-fade-in">
              Selected cell: {selectedCellIndex + 1}
            </div>
          )}
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            <span>Click hexagons to upload photos</span>
          </div>
          <div className="flex items-center gap-2">
            <Move className="w-4 h-4 text-primary" />
            <span>Drag to reposition images</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <span>Export high-res for printing</span>
          </div>
        </div>
      </Card>
    </div>
  );
};