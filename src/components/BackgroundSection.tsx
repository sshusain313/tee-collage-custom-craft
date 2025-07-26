
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Palette, 
  Image as ImageIcon, 
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface BackgroundSectionProps {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  backgroundGradient: string[];
  setBackgroundGradient: (gradient: string[]) => void;
  backgroundPattern: string;
  setBackgroundPattern: (pattern: string) => void;
  backgroundImage: string;
  setBackgroundImage: (image: string) => void;
}

export const BackgroundSection = ({
  backgroundColor,
  setBackgroundColor,
  backgroundGradient,
  setBackgroundGradient,
  backgroundPattern,
  setBackgroundPattern,
  backgroundImage,
  setBackgroundImage
}: BackgroundSectionProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [backgroundType, setBackgroundType] = useState<'color' | 'gradient' | 'pattern' | 'image'>('color');
  const [backgroundOpacity, setBackgroundOpacity] = useState([100]);
  const [backgroundBlur, setBackgroundBlur] = useState([0]);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<string[]>([]);

  const backgroundTypes = [
    { type: 'color' as const, label: 'Solid Color', icon: Palette },
    { type: 'gradient' as const, label: 'Gradient', icon: Palette },
    { type: 'pattern' as const, label: 'Pattern', icon: Palette, soon: true },
    { type: 'image' as const, label: 'Image', icon: ImageIcon },
  ];

  const gradientPresets = [
    { name: 'Sunset', colors: ['#ff7e5f', '#feb47b'] },
    { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
    { name: 'Forest', colors: ['#11998e', '#38ef7d'] },
    { name: 'Purple', colors: ['#667eea', '#764ba2'] },
    { name: 'Pink', colors: ['#f093fb', '#f5576c'] },
    { name: 'Gold', colors: ['#f7971e', '#ffd200'] },
  ];

  const patternPresets = [
    { name: 'Dots', pattern: 'dots' },
    { name: 'Lines', pattern: 'lines' },
    { name: 'Grid', pattern: 'grid' },
    { name: 'Diagonal', pattern: 'diagonal' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setUploadedBackgrounds([...uploadedBackgrounds, result]);
        setBackgroundImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Background Type Selection */}
      <div className="grid grid-cols-2 gap-2">
        {backgroundTypes.map(({ type, label, icon: Icon, soon }) => (
          <Button
            key={type}
            variant={backgroundType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBackgroundType(type)}
            className="flex flex-col items-center gap-1 h-auto py-3 relative"
            disabled={soon}
          >
            {soon && (
              <Badge className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs">
                soon
              </Badge>
            )}
            <Icon className="w-4 h-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>

      <Separator />

      {/* Color Background */}
      {backgroundType === 'color' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-12 h-8 rounded border-0 p-0"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1"
              placeholder="#ffffff"
            />
          </div>
        </div>
      )}

      {/* Gradient Background */}
      {backgroundType === 'gradient' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {gradientPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => setBackgroundGradient(preset.colors)}
                className="h-8 p-0 overflow-hidden"
                style={{
                  background: `linear-gradient(45deg, ${preset.colors[0]}, ${preset.colors[1]})`
                }}
              >
                <span className="sr-only">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Background */}
      {backgroundType === 'pattern' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {patternPresets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => setBackgroundPattern(preset.pattern)}
                className="flex items-center gap-2"
              >
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Image Background */}
      {backgroundType === 'image' && (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="bg-upload"
            />
            <label htmlFor="bg-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Upload background image
              </span>
            </label>
          </div>

          {uploadedBackgrounds.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {uploadedBackgrounds.map((url, index) => (
                <div key={index} className="relative group">
                  <Button
                    variant="outline"
                    className={`w-full h-16 p-0 overflow-hidden ${
                      backgroundImage === url ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setBackgroundImage(url)}
                  >
                    <img
                      src={url}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const newBgs = uploadedBackgrounds.filter((_, i) => i !== index);
                      setUploadedBackgrounds(newBgs);
                      if (backgroundImage === url) {
                        setBackgroundImage('');
                      }
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advanced Controls */}
      <div className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 w-full justify-center"
        >
          {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </Button>

        {showAdvanced && (
          <Card className="p-3 space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Opacity: {backgroundOpacity[0]}%
              </label>
              <Slider
                value={backgroundOpacity}
                onValueChange={setBackgroundOpacity}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Blur: {backgroundBlur[0]}px
              </label>
              <Slider
                value={backgroundBlur}
                onValueChange={setBackgroundBlur}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </Card>
        )}
      </div>

      {/* Apply Button */}
      <Button className="w-full" variant="creative">
        <Palette className="w-4 h-4 mr-2" />
        Apply Background
      </Button>
    </div>
  );
};
