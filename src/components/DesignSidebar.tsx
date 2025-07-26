
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Grid3X3, 
  Type, 
  Image, 
  Download, 
  Layers,
  Sparkles,
  Brush
} from 'lucide-react';
import { BackgroundSection } from './BackgroundSection';
import { TextSection } from './TextSection';
import { ElementsSection } from './ElementsSection';

interface DesignSidebarProps {
  selectedTool: 'background' | 'text' | 'elements';
  onToolChange: (tool: 'background' | 'text' | 'elements') => void;
  onDownload: () => void;
}

export const DesignSidebar: React.FC<DesignSidebarProps> = ({
  selectedTool,
  onToolChange,
  onDownload
}) => {
  // Background state
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundGradient, setBackgroundGradient] = useState<string[]>(['#ff6b6b', '#4ecdc4']);
  const [backgroundPattern, setBackgroundPattern] = useState<string>('none');
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  const tools = [
    { id: 'background' as const, label: 'Background', icon: Palette },
    { id: 'text' as const, label: 'Text', icon: Type },
    { id: 'elements' as const, label: 'Elements', icon: Sparkles },
  ];

  const renderToolContent = () => {
    switch (selectedTool) {
      case 'background':
        return (
          <BackgroundSection
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            backgroundGradient={backgroundGradient}
            setBackgroundGradient={setBackgroundGradient}
            backgroundPattern={backgroundPattern}
            setBackgroundPattern={setBackgroundPattern}
            backgroundImage={backgroundImage}
            setBackgroundImage={setBackgroundImage}
          />
        );
      case 'text':
        return <TextSection fabricCanvas={null} />;
      case 'elements':
        return <ElementsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-gradient-card border-r border-border h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Brush className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Design Studio</h2>
        </div>
        
        {/* Tool Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-lg">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onToolChange(tool.id)}
              className="flex flex-col gap-1 h-auto py-2"
            >
              <tool.icon className="w-4 h-4" />
              <span className="text-xs">{tool.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderToolContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button 
          onClick={onDownload} 
          className="w-full gap-2" 
          variant="hero"
        >
          <Download className="w-4 h-4" />
          Export Design
        </Button>
      </div>
    </div>
  );
};
