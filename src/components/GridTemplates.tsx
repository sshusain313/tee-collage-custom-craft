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
  const createHexagonalGrid = useCallback((canvas: FabricCanvas, columns = 8, rows = 8) => {
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    
    // Calculate optimal hex size based on canvas width and column count
    const maxColumns = Math.min(columns, 16); // Cap at 16 columns
    const hexSize = Math.min(45, (canvasWidth - 40) / (maxColumns * 1.5));
    
    // Calculate how many rows we can fit
    const hexHeight = hexSize * Math.sqrt(3);
    const maxRows = rows; // Use the passed-in value instead of calculating
    
    const startX = (canvasWidth - (maxColumns - 1) * hexSize * 1.5) / 2;
    const startY = (canvasHeight - maxRows * hexHeight * 0.75) / 2;
    
    const cells: GridCell[] = [];

    for (let row = 0; row < maxRows; row++) {
      const colsInRow = row % 2 === 0 ? maxColumns : maxColumns - 1;
      for (let col = 0; col < colsInRow; col++) {
        const offsetX = row % 2 === 0 ? 0 : hexSize * 0.75;
        const x = startX + col * hexSize * 1.5 + offsetX;
        const y = startY + row * hexHeight * 0.75;

        // Skip if hexagon would be outside canvas bounds
        if (x - hexSize < 0 || x + hexSize > canvasWidth || 
            y - hexSize < 0 || y + hexSize > canvasHeight) {
          continue;
        }

        // Create hexagon points (flat-top orientation)
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
          points.push({
            x: hexSize * Math.cos(angle),
            y: hexSize * Math.sin(angle)
          });
        }

        const hexagon = new Polygon(points, {
          left: x,
          top: y,
          fill: 'rgba(200, 200, 200, 0.1)',
          stroke: 'hsl(280, 100%, 60%)',
          strokeWidth: 1.5,
          selectable: true,
          hasControls: true,
          hasBorders: true,
          evented: true,
          originX: 'center',
          originY: 'center',
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

  const createSquareGrid = useCallback((canvas: FabricCanvas, rows = 4, columns = 4) => {
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    
    const cellSize = Math.min(canvasWidth, canvasHeight) / (Math.max(rows, columns) + 1);
    const startX = (canvasWidth - columns * cellSize) / 2;
    const startY = (canvasHeight - rows * cellSize) / 2;
    
    const cells: GridCell[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
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
          selectable: true,
          hasControls: true,
          hasBorders: true,
          evented: true,
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
        selectable: true,
        hasControls: true,
        hasBorders: true,
        evented: true,
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

  const createCenterFocusGrid = useCallback((canvas: FabricCanvas, count = 8) => {
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
      selectable: true,
      hasControls: true,
      hasBorders: true,
      evented: true,
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
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const x = centerX + surroundingRadius * Math.cos(angle);
      const y = centerY + surroundingRadius * Math.sin(angle);

      const circle = new Circle({
        left: x - surroundingSize,
        top: y - surroundingSize,
        radius: surroundingSize,
        fill: 'rgba(200, 200, 200, 0.1)',
        stroke: 'hsl(280, 100%, 60%)',
        strokeWidth: 1.5,
        selectable: true,
        hasControls: true,
        hasBorders: true,
        evented: true,
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
