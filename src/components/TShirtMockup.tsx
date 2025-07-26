
import React, { useRef, useEffect } from 'react';
import { TShirtConfig } from '@/pages/Preview';

interface TShirtMockupProps {
  collageImage: string;
  config: TShirtConfig;
  zoom: number;
  onConfigChange: (config: TShirtConfig) => void;
}

export const TShirtMockup: React.FC<TShirtMockupProps> = ({
  collageImage,
  config,
  zoom,
  onConfigChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    drawMockup();
  }, [collageImage, config, zoom]);

  const drawMockup = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas and set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw T-shirt mockup
    drawTShirtMockup(ctx);
  };

  const drawTShirtMockup = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    
    // Load T-shirt image from public folder
    const tshirtImage = new Image();
    tshirtImage.onload = () => {
      // Draw T-shirt mockup
      ctx.drawImage(tshirtImage, 0, 0, canvas.width, canvas.height);
      
      // Apply color overlay only to the T-shirt area if not white
      if (config.color !== '#ffffff') {
        // Create a temporary canvas to apply color overlay only to the T-shirt
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          
          // Draw the T-shirt image on temp canvas
          tempCtx.drawImage(tshirtImage, 0, 0, canvas.width, canvas.height);
          
          // Apply color overlay only to non-transparent pixels
          const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Convert hex color to RGB
          const hex = config.color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          
          for (let i = 0; i < data.length; i += 4) {
            // Only apply color to non-transparent pixels (alpha > 0)
            if (data[i + 3] > 0) {
              // Apply color overlay using multiply blend mode
              data[i] = Math.floor((data[i] * r) / 255);     // Red
              data[i + 1] = Math.floor((data[i + 1] * g) / 255); // Green
              data[i + 2] = Math.floor((data[i + 2] * b) / 255); // Blue
              // Keep original alpha
            }
          }
          
          tempCtx.putImageData(imageData, 0, 0);
          
          // Clear the main canvas and redraw
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the colored T-shirt
          ctx.drawImage(tempCanvas, 0, 0);
        }
      }

      // Draw collage on T-shirt
      drawCollageOnTShirt(ctx);
    };
    
    // Use the T-shirt image from public folder
    tshirtImage.src = '/lovable-uploads/daa84bd7-cc62-4500-9a32-f2a7e0cfb145.png';
  };

  const drawCollageOnTShirt = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate collage position and size on T-shirt
      const tshirtWidth = canvas.width;
      const tshirtHeight = canvas.height;
      
      // Define T-shirt chest area (adjust these values based on your T-shirt mockup)
      const chestArea = {
        x: tshirtWidth * 0.25,
        y: tshirtHeight * 0.35,
        width: tshirtWidth * 0.5,
        height: tshirtHeight * 0.4
      };

      // Calculate collage dimensions
      const collageWidth = chestArea.width * config.collageScale;
      const collageHeight = chestArea.height * config.collageScale;
      
      // Calculate position with offset
      const x = chestArea.x + (chestArea.width - collageWidth) / 2 + config.collageX;
      const y = chestArea.y + (chestArea.height - collageHeight) / 2 + config.collageY;

      // Draw collage
      ctx.drawImage(img, x, y, collageWidth, collageHeight);

      // Draw quote if present
      if (config.quote) {
        drawQuote(ctx, config.quote, x + collageWidth / 2, y + collageHeight + 20);
      }
    };
    
    img.src = collageImage;
  };

  const drawQuote = (ctx: CanvasRenderingContext2D, quote: string, x: number, y: number) => {
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(quote, x, y);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;

    onConfigChange({
      ...config,
      collageX: config.collageX + deltaX,
      collageY: config.collageY + deltaY
    });

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative bg-gray-50 rounded-lg p-8">
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        className="mx-auto cursor-move border rounded-lg shadow-lg bg-white"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-md text-sm text-gray-600 shadow-sm">
        {config.view === 'front' ? 'Front View' : 'Back View'}
      </div>
      
      <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-md text-xs text-gray-500 shadow-sm">
        {config.style === 'polo' ? 'Polo Shirt' : config.style === 'oversized' ? 'Oversized Tee' : 'Round Neck Tee'}
      </div>
    </div>
  );
};
