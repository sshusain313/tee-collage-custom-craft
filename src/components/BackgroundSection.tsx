
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
  Layers,
  RotateCw,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as fabric from 'fabric';

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

export const BackgroundSection = ({ 
  fabricCanvas,
  backgroundType,
  setBackgroundType,
  backgroundColor,
  setBackgroundColor,
  backgroundGradient,
  setBackgroundGradient,
  backgroundPattern,
  setBackgroundPattern,
  backgroundOpacity,
  setBackgroundOpacity,
  backgroundBlur,
  setBackgroundBlur,
  uploadedBackgrounds,
  setUploadedBackgrounds,
  selectedBackgroundImage,
  setSelectedBackgroundImage
}: { 
  fabricCanvas?: any;
  backgroundType?: 'color' | 'gradient' | 'pattern' | 'image';
  setBackgroundType?: (type: 'color' | 'gradient' | 'pattern' | 'image') => void;
  backgroundColor?: string;
  setBackgroundColor?: (color: string) => void;
  backgroundGradient?: any;
  setBackgroundGradient?: (gradient: any) => void;
  backgroundPattern?: any;
  setBackgroundPattern?: (pattern: any) => void;
  backgroundOpacity?: number[];
  setBackgroundOpacity?: (opacity: number[]) => void;
  backgroundBlur?: number[];
  setBackgroundBlur?: (blur: number[]) => void;
  uploadedBackgrounds?: string[];
  setUploadedBackgrounds?: (urls: string[]) => void;
  selectedBackgroundImage?: string;
  setSelectedBackgroundImage?: (url: string) => void;
}) => {
  const [selectedType, setSelectedType] = useState<'color' | 'gradient' | 'pattern' | 'image'>('color');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [selectedGradient, setSelectedGradient] = useState(gradientPresets[0]);
  const [selectedPattern, setSelectedPattern] = useState(patternOptions[0]);
  const [internalBackgroundOpacity, setInternalBackgroundOpacity] = useState([100]);
  const [internalBackgroundBlur, setInternalBackgroundBlur] = useState([0]);
  const [internalUploadedBackgrounds, setInternalUploadedBackgrounds] = useState<string[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>('');

  // Use props if provided, otherwise use internal state
  const currentType = backgroundType || selectedType;
  const setCurrentType = setBackgroundType || setSelectedType;
  const currentColor = backgroundColor || selectedColor;
  const setCurrentColor = setBackgroundColor || setSelectedColor;
  const currentGradient = backgroundGradient || selectedGradient;
  const setCurrentGradient = setBackgroundGradient || setSelectedGradient;
  const currentPattern = backgroundPattern || selectedPattern;
  const setCurrentPattern = setBackgroundPattern || setSelectedPattern;
  const currentOpacity = backgroundOpacity || internalBackgroundOpacity;
  const setCurrentOpacity = setBackgroundOpacity || setInternalBackgroundOpacity;
  const currentBlur = backgroundBlur || internalBackgroundBlur;
  const setCurrentBlur = setBackgroundBlur || setInternalBackgroundBlur;
  const currentUploadedBackgrounds = uploadedBackgrounds || internalUploadedBackgrounds;
  const setCurrentUploadedBackgrounds = setUploadedBackgrounds || setInternalUploadedBackgrounds;
  const currentSelectedBackground = selectedBackgroundImage || selectedBackground;
  const setCurrentSelectedBackground = setSelectedBackgroundImage || setSelectedBackground;

  const handleTypeChange = useCallback((type: 'color' | 'gradient' | 'pattern' | 'image') => {
    setCurrentType(type);
    
    toast({
      title: "Background Type Changed",
      description: `Switched to ${type} background`,
    });
  }, [setCurrentType]);

  const handleColorSelect = useCallback((color: string) => {
    setCurrentColor(color);
    
    toast({
      title: "Color Applied",
      description: "Background color updated",
    });
  }, [setCurrentColor]);

  const handleGradientSelect = useCallback((gradient: typeof gradientPresets[0]) => {
    setCurrentGradient(gradient);
    
    toast({
      title: "Gradient Applied",
      description: `${gradient.name} gradient applied`,
    });
  }, [setCurrentGradient]);

  const handlePatternSelect = useCallback((pattern: typeof patternOptions[0]) => {
    setCurrentPattern(pattern);
    
    toast({
      title: "Pattern Applied",
      description: `${pattern.name} pattern applied`,
    });
  }, [setCurrentPattern]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setCurrentUploadedBackgrounds([...currentUploadedBackgrounds, imageUrl]);
      setCurrentSelectedBackground(imageUrl);
      
      toast({
        title: "Background Uploaded",
        description: "Custom background image added",
      });
    }
  }, [currentUploadedBackgrounds, setCurrentUploadedBackgrounds, setCurrentSelectedBackground]);

  const removeBackground = useCallback((imageUrl: string) => {
    setCurrentUploadedBackgrounds(currentUploadedBackgrounds.filter(url => url !== imageUrl));
    if (currentSelectedBackground === imageUrl) {
      setCurrentSelectedBackground('');
    }
    
    toast({
      title: "Background Removed",
      description: "Background image deleted",
    });
  }, [currentUploadedBackgrounds, currentSelectedBackground, setCurrentUploadedBackgrounds, setCurrentSelectedBackground]);

       const previewStyle = {
    backgroundColor: currentType === 'color' ? currentColor : 'transparent',
    backgroundImage: currentType === 'gradient' ? currentGradient.value : 
                    currentType === 'image' && currentSelectedBackground ? `url(${currentSelectedBackground})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: currentOpacity[0] / 100,
    filter: `blur(${currentBlur[0]}px)`,
  };

     const applyBackgroundToCanvas = useCallback(() => {
    if (!fabricCanvas) return;
    
    // Clear existing background
    fabricCanvas.backgroundColor = 'transparent';
    fabricCanvas.backgroundImage = null;
    
    // Apply new background based on type
    if (currentType === 'color') {
      // For color backgrounds, we need to apply opacity to the color itself
      const opacity = currentOpacity[0] / 100;
      const colorWithOpacity = hexToRgba(currentColor, opacity);
      fabricCanvas.backgroundColor = colorWithOpacity;
    } else if (currentType === 'gradient') {
      // For gradient backgrounds, create a Fabric.js gradient object
      const opacity = currentOpacity[0] / 100;
      const gradient = createFabricGradient(currentGradient.value, opacity);
      fabricCanvas.backgroundColor = gradient;
    } else if (currentType === 'image' && currentSelectedBackground) {
      // Load image and set as background with opacity
      (fabric.Image.fromURL as any)(currentSelectedBackground, (img: any) => {
        img.set({
          left: 0,
          top: 0,
          width: fabricCanvas.width,
          height: fabricCanvas.height,
          selectable: false,
          evented: false,
          opacity: currentOpacity[0] / 100, // Apply opacity to the image
        });
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas));
      });
    }
    
    // Apply blur filter if needed
    if (currentBlur[0] > 0) {
      const blurFilter = new (fabric.Image.filters.Blur as any)({
        blur: currentBlur[0] / 10
      });
      if (fabricCanvas.backgroundImage) {
        (fabricCanvas.backgroundImage as any).filters = [blurFilter];
        (fabricCanvas.backgroundImage as any).applyFilters();
      }
    }
    
    fabricCanvas.renderAll();
    
    toast({
      title: "Background Applied",
      description: `${currentType} background applied to canvas`,
    });
  }, [fabricCanvas, currentType, currentColor, currentGradient, currentSelectedBackground, currentOpacity, currentBlur]);

  // Helper function to convert hex color to rgba with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Helper function to create Fabric.js gradient from CSS gradient
  const createFabricGradient = (cssGradient: string, opacity: number) => {
    // Parse CSS gradient to extract colors and direction
    const gradientMatch = cssGradient.match(/linear-gradient\(([^)]+)\)/);
    if (!gradientMatch) return 'transparent';
    
    const gradientContent = gradientMatch[1];
    const colorStops = gradientContent.split(',').map(stop => stop.trim());
    
    // Extract direction (simplified - assumes 135deg for most gradients)
    const direction = colorStops[0];
    const isDiagonal = direction.includes('135deg');
    
    // Extract colors
    const colors = colorStops.slice(1).map(stop => {
      const colorMatch = stop.match(/#[a-fA-F0-9]{6}/);
      if (colorMatch) {
        const hex = colorMatch[0];
        return hexToRgba(hex, opacity);
      }
      return 'transparent';
    });
    
    // Create Fabric.js gradient object
    const gradient = new (fabric.Gradient as any)({
      type: 'linear',
      coords: {
        x1: isDiagonal ? 0 : 0,
        y1: isDiagonal ? 0 : 0,
        x2: isDiagonal ? fabricCanvas?.width || 400 : 0,
        y2: isDiagonal ? fabricCanvas?.height || 400 : fabricCanvas?.height || 400,
      },
      colorStops: [
        { offset: 0, color: colors[0] || 'transparent' },
        { offset: 1, color: colors[1] || 'transparent' }
      ]
    });
    
    return gradient;
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
             {currentType}
           </Badge>
         </div>
         <div 
           className="w-full h-24 rounded-lg border border-border cursor-pointer hover:border-primary transition-colors"
           style={previewStyle}
           onClick={applyBackgroundToCanvas}
           title="Click to apply this background to the canvas"
         />
       </Card>

             {/* Color Options */}
       {currentType === 'color' && (
         <div className="space-y-2">
           <h4 className="text-sm font-medium">Solid Colors</h4>
           <div className="grid grid-cols-6 gap-2">
             {solidColors.map((color) => (
               <button
                 key={color}
                 className={`w-8 h-8 rounded-md border-2 ${
                   currentColor === color ? 'border-primary' : 'border-border'
                 }`}
                 style={{ backgroundColor: color }}
                 onClick={() => handleColorSelect(color)}
               />
             ))}
           </div>
           <Input
             type="color"
             value={currentColor}
             onChange={(e) => handleColorSelect(e.target.value)}
             className="w-full h-10"
           />
         </div>
       )}

             {/* Gradient Options */}
       {currentType === 'gradient' && (
         <div className="space-y-2">
           <h4 className="text-sm font-medium">Gradient Presets</h4>
           <div className="grid grid-cols-2 gap-2">
             {gradientPresets.map((gradient) => (
               <Button
                 key={gradient.id}
                 variant={currentGradient.id === gradient.id ? 'default' : 'outline'}
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
       {currentType === 'pattern' && (
         <div className="space-y-2">
           <h4 className="text-sm font-medium">Patterns</h4>
           <div className="grid grid-cols-3 gap-2">
             {patternOptions.map((pattern) => {
               const Icon = pattern.icon;
               return (
                 <Button
                   key={pattern.id}
                   variant={currentPattern.id === pattern.id ? 'default' : 'outline'}
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
       {currentType === 'image' && (
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
           {currentUploadedBackgrounds.length > 0 && (
             <div className="space-y-2">
               <h5 className="text-sm font-medium">Your Images</h5>
               <div className="grid grid-cols-2 gap-2">
                 {currentUploadedBackgrounds.map((imageUrl, index) => (
                   <div key={index} className="relative group">
                     <div 
                       className={`aspect-video rounded-lg border-2 cursor-pointer ${
                         currentSelectedBackground === imageUrl ? 'border-primary' : 'border-border'
                       }`}
                       style={{
                         backgroundImage: `url(${imageUrl})`,
                         backgroundSize: 'cover',
                         backgroundPosition: 'center'
                       }}
                       onClick={() => setCurrentSelectedBackground(imageUrl)}
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
             <span className="text-xs text-muted-foreground">{currentOpacity[0]}%</span>
           </div>
           <Slider
             value={currentOpacity}
             onValueChange={setCurrentOpacity}
             max={100}
             min={0}
             step={1}
             className="w-full"
           />
         </div>

         <div className="space-y-2">
           <div className="flex items-center justify-between">
             <label className="text-sm font-medium">Blur</label>
             <span className="text-xs text-muted-foreground">{currentBlur[0]}px</span>
           </div>
           <Slider
             value={currentBlur}
             onValueChange={setCurrentBlur}
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
               setCurrentColor('#ffffff');
               setCurrentType('color');
               setCurrentOpacity([100]);
               setCurrentBlur([0]);
             }}
           >
             <Eye className="w-4 h-4 mr-2" />
             Reset
           </Button>
           <Button
             variant="outline"
             size="sm"
             onClick={() => {
               setCurrentColor('#000000');
               setCurrentType('color');
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
