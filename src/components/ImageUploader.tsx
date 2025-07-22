
import { useCallback } from 'react';
import { FabricImage } from 'fabric';
import { toast } from '@/hooks/use-toast';
import { GridCell } from './GridTemplates';

// Import the fitImageToCell function from CollageCanvas
import { fitImageToCell } from './CollageCanvas';

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

      // Remove previous image if exists
      if (cell.image) {
        fabricCanvas.remove(cell.image);
      }

      // Use the shared fitImageToCell function
      fitImageToCell(img, cell);

      fabricCanvas.add(img);
      // Cast to any to avoid type errors since we know bringToFront exists at runtime
      if (typeof (img as any).bringToFront === 'function') {
        (img as any).bringToFront();
      }
      fabricCanvas.renderAll();

      // Update cell data
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
