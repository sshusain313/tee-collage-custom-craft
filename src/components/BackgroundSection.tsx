import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Image, 
  Upload, 
  Grid3X3, 
  Zap, 
  Focus, 
  Layers,
  RotateCw,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BackgroundOption {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'pattern' | 'image';
  value: string;
  preview?: string;
}

const solidColors = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd',
  '#6c757d', '#495057', '#343a40', '#212529', '#000000', '#ff6b6b',
  '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ff9ff3',
  '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#ee5a24', '#0abde3'
];

const gradientPresets = [
  { id: 'sunset', name: 'Sunset', value: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)' },
  { id: 'ocean', name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'forest', name: 'Forest', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'purple', name: 'Purple', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'pink', name: 'Pink', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { id: 'blue', name: 'Blue', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
];

const patternOptions = [
  { id: 'dots', name: 'Dots', icon: Grid3X3 },
  { id: 'stripes', name: 'Stripes', icon: Layers },
  { id: 'zigzag', name: 'Zigzag', icon: Zap },
  { id: 'waves', name: 'Waves', icon: RotateCw },
  { id: 'geometric', name: 'Geometric', icon: Grid3X3 },
  { id: 'texture', name: 'Texture', icon: Palette },
];

export const BackgroundSection = () => {
  const [selectedType, setSelectedType] = useState<'color' | 'gradient' | 'pattern' | 'image'>('color');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedGradient, setSelectedGradient] = useState(gradientPresets[0]);
  const [selectedPattern, setSelectedPattern] = useState(patternOptions[0]);
  const [backgroundOpacity, setBackgroundOpacity] = useState([100]);
  const [backgroundBlur, setBackgroundBlur] = useState([0]);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<string[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>('');

  const handleTypeChange = useCallback((type: 'color' | 'gradient' | 'pattern' | 'image') => {
    setSelectedType(type);
    
    toast({
      title: "Background Type Changed",
      description: `Switched to ${type} background`,
    });
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    setSelectedColor(color);
    
    toast({
      title: "Color Applied",
      description: "Background color updated",
    });
  }, []);

  const handleGradientSelect = useCallback((gradient: typeof gradientPresets[0]) => {
    setSelectedGradient(gradient);
    
    toast({
      title: "Gradient Applied",
      description: `${gradient.name} gradient applied`,
    });
  }, []);

  const handlePatternSelect = useCallback((pattern: typeof patternOptions[0]) => {
    setSelectedPattern(pattern);
    
    toast({
      title: "Pattern Applied",
      description: `${pattern.name} pattern applied`,
    });
  }, []);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedBackgrounds(prev => [...prev, imageUrl]);
      setSelectedBackground(imageUrl);
      
      toast({
        title: "Background Uploaded",
        description: "Custom background image added",
      });
    }
  }, []);

  const removeBackground = useCallback((imageUrl: string) => {
    setUploadedBackgrounds(prev => prev.filter(url => url !== imageUrl));
    if (selectedBackground === imageUrl) {
      setSelectedBackground('');
    }
    
    toast({
      title: "Background Removed",
      description: "Background image deleted",
    });
  }, [selectedBackground]);

  const previewStyle = {
    backgroundColor: selectedType === 'color' ? selectedColor : 'transparent',
    backgroundImage: selectedType === 'gradient' ? selectedGradient.value : 
                    selectedType === 'image' && selectedBackground ? `url(${selectedBackground})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: backgroundOpacity[0] / 100,
    filter: `blur(${backgroundBlur[0]}px)`,
  };

  return (
    <div className="space-y-4">
      {/* Background Type Selector */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Background Type</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedType === 'color' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('color')}
            className="flex items-center gap-2"
          >
            <Palette className="w-4 h-4" />
            Color
          </Button>
          <Button
            variant={selectedType === 'gradient' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('gradient')}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Gradient
          </Button>
          <Button
            variant={selectedType === 'pattern' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('pattern')}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Pattern
          </Button>
          <Button
            variant={selectedType === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('image')}
            className="flex items-center gap-2"
          >
            <Image className="w-4 h-4" />
            Image
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-medium">Preview</h5>
          <Badge variant="secondary" className="text-xs">
            {selectedType}
          </Badge>
        </div>
        <div 
          className="w-full h-24 rounded-lg border border-border"
          style={previewStyle}
        />
      </Card>

      {/* Color Options */}
      {selectedType === 'color' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Solid Colors</h4>
          <div className="grid grid-cols-6 gap-2">
            {solidColors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-md border-2 ${
                  selectedColor === color ? 'border-primary' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
          <Input
            type="color"
            value={selectedColor}
            onChange={(e) => handleColorSelect(e.target.value)}
            className="w-full h-10"
          />
        </div>
      )}

      {/* Gradient Options */}
      {selectedType === 'gradient' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Gradient Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {gradientPresets.map((gradient) => (
              <Button
                key={gradient.id}
                variant={selectedGradient.id === gradient.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleGradientSelect(gradient)}
                className="h-12 p-2"
              >
                <div 
                  className="w-full h-full rounded-sm"
                  style={{ background: gradient.value }}
                />
                <span className="ml-2 text-xs">{gradient.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Options */}
      {selectedType === 'pattern' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Patterns</h4>
          <div className="grid grid-cols-3 gap-2">
            {patternOptions.map((pattern) => {
              const Icon = pattern.icon;
              return (
                <Button
                  key={pattern.id}
                  variant={selectedPattern.id === pattern.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePatternSelect(pattern)}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{pattern.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Options */}
      {selectedType === 'image' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Background Images</h4>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload background image
            </p>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>Choose Image</span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Uploaded Images */}
          {uploadedBackgrounds.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Your Images</h5>
              <div className="grid grid-cols-2 gap-2">
                {uploadedBackgrounds.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div 
                      className={`aspect-video rounded-lg border-2 cursor-pointer ${
                        selectedBackground === imageUrl ? 'border-primary' : 'border-border'
                      }`}
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onClick={() => setSelectedBackground(imageUrl)}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeBackground(imageUrl)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Separator />

      {/* Background Effects */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Effects</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Opacity</label>
            <span className="text-xs text-muted-foreground">{backgroundOpacity[0]}%</span>
          </div>
          <Slider
            value={backgroundOpacity}
            onValueChange={setBackgroundOpacity}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Blur</label>
            <span className="text-xs text-muted-foreground">{backgroundBlur[0]}px</span>
          </div>
          <Slider
            value={backgroundBlur}
            onValueChange={setBackgroundBlur}
            max={20}
            min={0}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedColor('#ffffff');
              setSelectedType('color');
              setBackgroundOpacity([100]);
              setBackgroundBlur([0]);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedColor('#000000');
              setSelectedType('color');
            }}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Black
          </Button>
        </div>
      </div>
    </div>
  );
};
