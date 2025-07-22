
import { useCallback } from 'react';
import { FabricImage, Polygon, Circle, Rect } from 'fabric';
import { toast } from '@/hooks/use-toast';
import { GridCell } from './GridTemplates';

export const useImageUploader = () => {
  const uploadImageToCell = useCallback((
    cell: GridCell, 
    fabricCanvas: any,
    onCellUpdate: (cellIndex: number, image: any) => void
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      console.log('File selected:', file.name, file.type, file.size);

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        addImageToCell(cell, imageUrl, fabricCanvas, onCellUpdate);
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Failed to read the selected file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    };
    
    input.click();
  }, []);

  const addImageToCell = useCallback((
    cell: GridCell,
    imageUrl: string,
    fabricCanvas: any,
    onCellUpdate: (cellIndex: number, image: any) => void
  ) => {
    console.log('Starting image upload for cell:', cell.index, cell.type);
    
    FabricImage.fromURL(imageUrl).then((img) => {
      console.log('Image loaded successfully:', {
        width: img.width,
        height: img.height,
        cellType: cell.type,
        cellSize: cell.size
      });
      // Create a proper clip path based on cell type
      let clipPath: any = null;

      if (cell.type === 'hexagonal') {
        // Create hexagon clip path with exact same dimensions as the cell shape
        const points = [];
        const hexSize = cell.size;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
          points.push({
            x: hexSize * Math.cos(angle),
            y: hexSize * Math.sin(angle)
          });
        }
        clipPath = new Polygon(points, {
          left: cell.centerX,
          top: cell.centerY,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true
        });
      } else if (cell.type === 'circular' || cell.type === 'center-focus') {
        // Create circle clip path with exact same dimensions as the cell shape
        clipPath = new Circle({
          radius: cell.size,
          left: cell.centerX,
          top: cell.centerY,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true
        });
      } else {
        // Create rectangle clip path for squares with exact same dimensions
        clipPath = new Rect({
          width: cell.size,
          height: cell.size,
          left: cell.centerX,
          top: cell.centerY,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true
        });
      }

      // Calculate proper scaling based on cell type to ensure complete fill
      let scale: number;
      
      if (cell.type === 'hexagonal') {
        // For hexagons, scale to fill the shape completely
        const hexRadius = cell.size;
        const imgMinDimension = Math.min(img.width!, img.height!);
        const imgMaxDimension = Math.max(img.width!, img.height!);
        // Use the larger scale to ensure complete coverage
        scale = Math.max(
          (hexRadius * 2.3) / imgMinDimension,
          (hexRadius * 2.3) / imgMaxDimension
        );
      } else if (cell.type === 'circular' || cell.type === 'center-focus') {
        // For circles, ensure the image covers the entire circle
        const diameter = cell.size * 2;
        scale = Math.max(
          diameter / img.width!,
          diameter / img.height!
        ) * 1.2; // 1.2 multiplier for complete coverage
      } else {
        // For squares and rectangles, ensure complete fill
        scale = Math.max(
          cell.size / img.width!,
          cell.size / img.height!
        ) * 1.2; // 1.2 multiplier for complete coverage
      }
      
      img.scale(scale);
      img.set({
        left: cell.centerX,
        top: cell.centerY,
        originX: 'center',
        originY: 'center',
        clipPath: clipPath,
        selectable: false, // Make image not selectable
        hasControls: false, // Hide controls
        hasBorders: false, // Hide borders
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        // Ensure the image stays within bounds
        lockUniScaling: false,
        centeredScaling: true,
        centeredRotation: true,
      });

      // Debug logging
      console.log('Adding image to cell:', {
        cellIndex: cell.index,
        cellType: cell.type,
        centerX: cell.centerX,
        centerY: cell.centerY,
        imageProps: {
          width: img.width,
          height: img.height,
          scale,
          left: cell.centerX,
          top: cell.centerY,
        },
        clipPath,
      });

      // Remove previous image if exists
      if (cell.image) {
        fabricCanvas.remove(cell.image);
      }

      fabricCanvas.add(img);
      if (typeof img.bringToFront === 'function') {
        img.bringToFront();
      }
      fabricCanvas.renderAll();

      // Update cell data (do not mutate cell.image directly)
      onCellUpdate(cell.index, img);

      toast({
        title: "Image Added!",
        description: `Photo perfectly fitted to ${cell.type} cell ${cell.index + 1}`,
      });
    }).catch((error) => {
      console.error('Error loading image:', error);
      toast({
        title: "Upload Error",
        description: `Failed to load the image: ${error.message || 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    });
  }, []);

  return { uploadImageToCell };
};
