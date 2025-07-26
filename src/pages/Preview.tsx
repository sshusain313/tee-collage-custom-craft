import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Share2, Download, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react';
import { TShirtMockup } from '@/components/TShirtMockup';
import { TShirtCustomizer } from '@/components/TShirtCustomizer';
import { DesignSidebar } from '@/components/DesignSidebar';
// import Layout from '@/components/Layout';
import { Canvas as FabricCanvas } from 'fabric';

export interface TShirtConfig {
  color: string;
  style: 'round-neck' | 'polo' | 'oversized';
  size: 'M' | 'L' | 'XL' | 'XXL';
  view: 'front' | 'back';
  collageScale: number;
  collageX: number;
  collageY: number;
  quote: string;
  showLabels: boolean;
}

const Preview: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [collageImage, setCollageImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [tshirtConfig, setTshirtConfig] = useState<TShirtConfig>({
    color: '#ffffff',
    style: 'round-neck',
    size: 'L',
    view: 'front',
    collageScale: 1,
    collageX: 0,
    collageY: 0,
    quote: '',
    showLabels: true
  });

  // Sidebar state
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'pattern' | 'image'>('color');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundGradient, setBackgroundGradient] = useState({});
  const [backgroundPattern, setBackgroundPattern] = useState({});
  const [backgroundOpacity, setBackgroundOpacity] = useState(100);
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<string[]>([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState('');

  useEffect(() => {
    // Load collage data based on projectId
    const savedCollage = localStorage.getItem(`collage-preview-${projectId}`);
    if (!savedCollage) {
      const fallbackCollage = localStorage.getItem('collage-preview');
      if (fallbackCollage) {
        setCollageImage(fallbackCollage);
      } else {
        navigate('/create-collage');
        return;
      }
    } else {
      setCollageImage(savedCollage);
    }

    // Load saved T-shirt config if exists
    const savedConfig = localStorage.getItem(`tshirt-config-${projectId}`);
    if (savedConfig) {
      setTshirtConfig(JSON.parse(savedConfig));
    }
  }, [projectId, navigate]);

  const handleBackToEditor = () => {
    // Save current config before leaving
    localStorage.setItem(`tshirt-config-${projectId}`, JSON.stringify(tshirtConfig));
    navigate('/create-collage');
  };

  const handleProceedToCheckout = () => {
    // Save current config
    localStorage.setItem(`tshirt-config-${projectId}`, JSON.stringify(tshirtConfig));
    navigate(`/checkout/${projectId}`);
  };

  const handleDownloadPreview = () => {
    if (!collageImage) return;
    
    const link = document.createElement('a');
    link.download = `tshirt-preview-${projectId}.png`;
    link.href = collageImage;
    link.click();
  };

  const handleSharePreview = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My T-Shirt Design Preview',
        text: 'Check out my custom T-shirt design!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleGridSelect = () => {
    // Grid functionality - placeholder for now
  };

  const handleShowGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleClearGrid = () => {
    setShowGrid(false);
  };

  const toggleLabels = () => {
    setShowLabels(!showLabels);
    setTshirtConfig(prev => ({ ...prev, showLabels: !showLabels }));
  };

  if (!collageImage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg">Loading your design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToEditor}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              <h1 className="text-xl font-bold">T-Shirt Preview</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLabels}
              >
                {showLabels ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showLabels ? 'Hide' : 'Show'} Labels
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPreview}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSharePreview}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

      <div className="flex h-screen">

        {/* Sidebar - Only T-Shirt Customizer */}
        <div className="w-1/4 border-l border-border bg-card p-4">
          <TShirtCustomizer
            config={tshirtConfig}
            onConfigChange={setTshirtConfig}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* T-Shirt Mockup */}
            <div className="flex-1 p-6 flex items-center justify-center">
              <TShirtMockup
                collageImage={collageImage}
                config={tshirtConfig}
                zoom={zoom}
                onConfigChange={setTshirtConfig}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Floating CTAs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <Button
          onClick={handleProceedToCheckout}
          className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all duration-200"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Proceed to Checkout
        </Button>
        
        <Button
          variant="outline"
          onClick={handleBackToEditor}
          className="px-6 py-3 rounded-full shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Editor
        </Button>
      </div>
    </div>
  );
};

export default Preview;
