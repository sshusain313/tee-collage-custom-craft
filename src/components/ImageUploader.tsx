
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
      // Create a proper clip path based on cell type
      let clipPath: any = null;

      if (cell.type === 'hexagonal') {
        // Create hexagon clip path
        const points = [];
        const hexSize = cell.size;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          points.push({
            x: hexSize * Math.cos(angle),
            y: hexSize * Math.sin(angle)
          });
        }
        
        const { Polygon } = require('fabric');
        clipPath = new Polygon(points, {
          left: 0,
          top: 0,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true
        });
      } else if (cell.type === 'circular' || cell.type === 'center-focus') {
        // Create circle clip path
        const { Circle } = require('fabric');
        clipPath = new Circle({
          radius: cell.size,
          left: 0,
          top: 0,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true
        });
      } else {
        // Create rectangle clip path for squares
        const { Rect } = require('fabric');
        clipPath = new Rect({
          width: cell.size,
          height: cell.size,
          left: 0,
          top: 0,
          originX: 'center',
          originY: 'center',
          absolutePositioned: true
        });
      }

      // Calculate proper scaling based on cell type
      let scale: number;
      
      if (cell.type === 'hexagonal') {
        // For hexagons, scale to fill the shape completely
        const hexRadius = cell.size;
        const imgDimension = Math.max(img.width!, img.height!);
        scale = (hexRadius * 2.2) / imgDimension; // 2.2 for complete fill
      } else if (cell.type === 'circular' || cell.type === 'center-focus') {
        // For circles, use diameter
        const diameter = cell.size * 2;
        scale = Math.max(diameter / img.width!, diameter / img.height!) * 1.1;
      } else {
        // For squares and rectangles
        scale = Math.max(cell.size / img.width!, cell.size / img.height!) * 1.1;
      }
      
      img.scale(scale);
      img.set({
        left: cell.centerX,
        top: cell.centerY,
        originX: 'center',
        originY: 'center',
        clipPath: clipPath,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
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
        description: `Photo perfectly fitted to ${cell.type} cell ${cell.index + 1}`,
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
