
import { useCallback } from 'react';
import { Canvas as FabricCanvas, Polygon, Circle, Rect } from 'fabric';

export type GridType = 'hexagonal' | 'square' | 'circular' | 'center-focus';

export interface GridCell {
  shape: any;
  image: any;
  index: number;
  centerX: number;
  centerY: number;
  size: number;
  type: GridType;
}

export const useGridTemplates = () => {
  const createHexagonalGrid = useCallback((canvas: FabricCanvas, rows = 8, cols = 7) => {
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    
    const hexSize = 45;
    const startX = (canvasWidth - cols * hexSize * 1.5) / 2;
    const startY = (canvasHeight - rows * hexSize * Math.sqrt(3)) / 2;
    
    const cells: GridCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * hexSize * 1.5;
        const y = startY + row * hexSize * Math.sqrt(3) / 2 + (col % 2) * hexSize * Math.sqrt(3) / 4;

        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          points.push({
            x: x + hexSize * Math.cos(angle),
            y: y + hexSize * Math.sin(angle)
          });
        }

        const hexagon = new Polygon(points, {
          fill: 'rgba(200, 200, 200, 0.1)',
          stroke: 'hsl(280, 100%, 60%)',
          strokeWidth: 1.5,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer',
        });

        cells.push({ 
          shape: hexagon,
          image: null, 
          index: cells.length,
          centerX: x,
          centerY: y,
          size: hexSize,
          type: 'hexagonal'
        });
      }
    }

    return cells;
  }, []);

  const createSquareGrid = useCallback((canvas: FabricCanvas, gridSize = 4) => {
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    
    const cellSize = Math.min(canvasWidth, canvasHeight) / (gridSize + 1);
    const startX = (canvasWidth - gridSize * cellSize) / 2;
    const startY = (canvasHeight - gridSize * cellSize) / 2;
    
    const cells: GridCell[] = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = startX + col * cellSize;
        const y = startY + row * cellSize;

        const square = new Rect({
          left: x,
          top: y,
          width: cellSize * 0.9,
          height: cellSize * 0.9,
          fill: 'rgba(200, 200, 200, 0.1)',
          stroke: 'hsl(280, 100%, 60%)',
          strokeWidth: 1.5,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer',
        });

        cells.push({ 
          shape: square,
          image: null, 
          index: cells.length,
          centerX: x + cellSize * 0.45,
          centerY: y + cellSize * 0.45,
          size: cellSize * 0.9,
          type: 'square'
        });
      }
    }

    return cells;
  }, []);

  const createCircularGrid = useCallback((canvas: FabricCanvas, count = 12) => {
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
    const circleSize = 35;
    
    const cells: GridCell[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const circle = new Circle({
        left: x - circleSize,
        top: y - circleSize,
        radius: circleSize,
        fill: 'rgba(200, 200, 200, 0.1)',
        stroke: 'hsl(280, 100%, 60%)',
        strokeWidth: 1.5,
        selectable: false,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'pointer',
      });

      cells.push({ 
        shape: circle,
        image: null, 
        index: cells.length,
        centerX: x,
        centerY: y,
        size: circleSize,
        type: 'circular'
      });
    }

    return cells;
  }, []);

  const createCenterFocusGrid = useCallback((canvas: FabricCanvas) => {
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const cells: GridCell[] = [];

    // Main center circle
    const centerCircle = new Circle({
      left: centerX - 60,
      top: centerY - 60,
      radius: 60,
      fill: 'rgba(200, 200, 200, 0.1)',
      stroke: 'hsl(280, 100%, 60%)',
      strokeWidth: 2,
      selectable: false,
      hasControls: false,
      hasBorders: false,
      hoverCursor: 'pointer',
    });

    cells.push({ 
      shape: centerCircle,
      image: null, 
      index: 0,
      centerX: centerX,
      centerY: centerY,
      size: 60,
      type: 'center-focus'
    });

    // Surrounding smaller circles
    const surroundingRadius = 120;
    const surroundingSize = 30;
    for (let i = 0; i < 8; i++) {
      const angle = (2 * Math.PI * i) / 8;
      const x = centerX + surroundingRadius * Math.cos(angle);
      const y = centerY + surroundingRadius * Math.sin(angle);

      const circle = new Circle({
        left: x - surroundingSize,
        top: y - surroundingSize,
        radius: surroundingSize,
        fill: 'rgba(200, 200, 200, 0.1)',
        stroke: 'hsl(280, 100%, 60%)',
        strokeWidth: 1.5,
        selectable: false,
        hasControls: false,
        hasBorders: false,
        hoverCursor: 'pointer',
      });

      cells.push({ 
        shape: circle,
        image: null, 
        index: cells.length,
        centerX: x,
        centerY: y,
        size: surroundingSize,
        type: 'center-focus'
      });
    }

    return cells;
  }, []);

  return {
    createHexagonalGrid,
    createSquareGrid,
    createCircularGrid,
    createCenterFocusGrid
  };
};
