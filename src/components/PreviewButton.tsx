import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Canvas as FabricCanvas } from 'fabric';

interface PreviewButtonProps {
  fabricCanvas: FabricCanvas | null;
  projectId?: string;
}

export const PreviewButton: React.FC<PreviewButtonProps> = ({ fabricCanvas, projectId = 'default' }) => {
  const navigate = useNavigate();

  const handlePreview = () => {
    if (!fabricCanvas) {
      toast({
        title: "Canvas not ready",
        description: "Please wait for the canvas to load before previewing.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Saving design...",
      description: "Generating preview...",
    });

    // Export canvas to data URL
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });

    // Save to localStorage with project ID
    localStorage.setItem(`collage-preview-${projectId}`, dataURL);
    localStorage.setItem('collage-preview', dataURL); // Fallback for backward compatibility
    
    // Navigate to preview page with project ID
    navigate(`/preview/${projectId}`);
  };

  return (
    <Button
      onClick={handlePreview}
      className="fixed bottom-6 right-6 px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-200 z-50"
    >
      <Eye className="w-5 h-5 mr-2" />
      Preview on T-Shirt
    </Button>
  );
};
