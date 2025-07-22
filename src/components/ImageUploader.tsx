
import { useCallback } from 'react';
import { FabricImage } from 'fabric';
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
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        addImageToCell(cell, imageUrl, fabricCanvas, onCellUpdate);
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
    FabricImage.fromURL(imageUrl).then((img) => {
      const shapeBounds = cell.shape.getBoundingRect();
      
      // Calculate scale to fill the shape completely
      let scale;
      if (cell.type === 'circular' || cell.type === 'center-focus') {
        // For circles, use the radius * 2 as the dimension
        const diameter = cell.size * 2;
        scale = Math.max(diameter / img.width!, diameter / img.height!) * 1.1;
      } else {
        // For polygons and rectangles
        scale = Math.max(shapeBounds.width / img.width!, shapeBounds.height / img.height!) * 1.1;
      }
      
      img.scale(scale);
      img.set({
        left: cell.centerX,
        top: cell.centerY,
        originX: 'center',
        originY: 'center',
        clipPath: cell.shape,
        selectable: true,
        hasControls: true,
        hasBorders: true,
      });

      // Remove previous image if exists
      if (cell.image) {
        fabricCanvas.remove(cell.image);
      }

      fabricCanvas.add(img);
      fabricCanvas.renderAll();

      // Update cell data
      onCellUpdate(cell.index, img);

      toast({
        title: "Image Added!",
        description: `Photo added to ${cell.type} cell ${cell.index + 1}`,
      });
    }).catch((error) => {
      console.error('Error loading image:', error);
      toast({
        title: "Upload Error",
        description: "Failed to load the image. Please try again.",
        variant: "destructive",
      });
    });
  }, []);

  return { uploadImageToCell };
};
