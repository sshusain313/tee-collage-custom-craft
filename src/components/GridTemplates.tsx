import { useCallback } from 'react';
import { Canvas as FabricCanvas, Polygon, Circle, Rect } from 'fabric';

export type GridType = 'hexagonal' | 'square' | 'center-focus';

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
  const createHexagonalGrid = useCallback((canvas: FabricCanvas) => {
    // 1 large center hexagon, 6 smaller hexagons tightly surrounding it (total 7)
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    // Large center hex size
    const largeHexSize = Math.min(canvasWidth, canvasHeight) / 4.5;
    // Small hex size (for ring)
    const smallHexSize = largeHexSize / 2;
    const gap = 2; // Minimal gap between hexagons
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const cells: GridCell[] = [];

    // Helper to create a hexagon at (cx, cy) with given size
    function makeHex(cx: number, cy: number, size: number) {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        points.push({
          x: size * Math.cos(angle),
          y: size * Math.sin(angle)
        });
      }
      return new Polygon(points, {
        left: cx,
        top: cy,
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
    }

    // Center large hexagon
    cells.push({
      shape: makeHex(centerX, centerY, largeHexSize),
      image: null,
      index: 0,
      centerX: centerX,
      centerY: centerY,
      size: largeHexSize,
      type: 'hexagonal'
    });

    // 6 surrounding small hexagons
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      // Distance from center: largeHexSize + smallHexSize + gap
      const dist = largeHexSize + smallHexSize + gap;
      const cx = centerX + dist * Math.cos(angle);
      const cy = centerY + dist * Math.sin(angle);
      cells.push({
        shape: makeHex(cx, cy, smallHexSize),
        image: null,
        index: i + 1,
        centerX: cx,
        centerY: cy,
        size: smallHexSize,
        type: 'hexagonal'
      });
    }

    return cells;
  }, []);

  const createSquareGrid = useCallback((canvas: FabricCanvas) => {
    // Only support 4x4 for this special layout
    const rows = 4;
    const columns = 4;
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;
    
    const cellSize = Math.min(canvasWidth, canvasHeight) / (Math.max(rows, columns) + 1);
    const startX = (canvasWidth - columns * cellSize) / 2;
    const startY = (canvasHeight - rows * cellSize) / 2;
    
    const cells: GridCell[] = [];

    // Outer cells (skip center 2x2 block)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Skip the center 2x2 block (rows 1,2 and cols 1,2)
        if (row >= 1 && row <= 2 && col >= 1 && col <= 2) continue;
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

    // Add one large center cell (covering the center 2x2 block)
    const centerX = startX + cellSize * 2.0;
    const centerY = startY + cellSize * 2.0;
    const centerSquare = new Rect({
      left: centerX - cellSize,
      top: centerY - cellSize,
      width: cellSize * 2 * 0.9,
      height: cellSize * 2 * 0.9,
      fill: 'rgba(200, 200, 200, 0.1)',
      stroke: 'hsl(280, 100%, 60%)',
      strokeWidth: 2,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      evented: true,
    });
    cells.push({
      shape: centerSquare,
      image: null,
      index: cells.length,
      centerX: centerX,
      centerY: centerY,
      size: cellSize * 2 * 0.9,
      type: 'square'
    });

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
    createCenterFocusGrid
  };
};
