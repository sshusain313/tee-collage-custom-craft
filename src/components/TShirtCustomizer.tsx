import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, Type, Star, Move, Shirt, Settings, Copy, RotateCcw,
  Palette, Grid3X3, Users, FileText, Layers, Zap, Eye, Download,
  Undo, Redo, Image, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, RotateCw, Trash2, Plus, Minus, Save, Palette as PaletteIcon,
  Droplets, Sparkles, ImagePlus, Type as TypeIcon, EyeOff, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TShirtConfig } from '@/pages/Preview';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TShirtCustomizerProps {
  config: TShirtConfig;
  onConfigChange: (config: TShirtConfig) => void;
}

type TabType = 'view' | 'color' | 'design' | 'text' | 'background' | 'preview';

interface TabConfig {
  id: TabType;
  icon: React.ElementType;
  label: string;
  description: string;
}

interface ColorPalette {
  name: string;
  colors: string[];
}

interface DesignElement {
  id: string;
  type: 'image' | 'shape' | 'icon';
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

interface TextElement {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
  x: number;
  y: number;
  rotation: number;
}

export const TShirtCustomizer: React.FC<TShirtCustomizerProps> = ({ 
  config,
  onConfigChange
 }) => {
  // Enhanced state management
  const [view, setView] = useState<'front' | 'back'>(config.view);
  const [tshirtColor, setTshirtColor] = useState(config.color);
  const [style, setStyle] = useState<'round-neck' | 'polo' | 'oversized'>(config.style);
  const [size, setSize] = useState<'M' | 'L' | 'XL' | 'XXL'>(config.size);
  const [collageSize, setCollageSize] = useState([config.collageScale * 100]);
  const [quote, setQuote] = useState(config.quote);
  const [showNameLabels, setShowNameLabels] = useState(config.showLabels);
  
  // Advanced color picker state
  const [customColor, setCustomColor] = useState('#000000');
  const [colorMode, setColorMode] = useState<'hex' | 'rgb'>('hex');
  const [savedColors, setSavedColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Design elements state
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  
  // Text elements state
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  
  // Background state
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient' | 'pattern' | 'image'>('solid');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundGradient, setBackgroundGradient] = useState({ from: '#ffffff', to: '#000000', angle: 0 });
  const [backgroundOpacity, setBackgroundOpacity] = useState(100);
  const [backgroundBlendMode, setBackgroundBlendMode] = useState('normal');
  
  // Preview state
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');
  const [previewRotation, setPreviewRotation] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  
  // History state
  const [history, setHistory] = useState<TShirtConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('view');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  // Enhanced color palettes
  const colorPalettes: ColorPalette[] = [
    {
      name: 'Classic',
      colors: ['#ffffff', '#000000', '#1f2937', '#dc2626', '#16a34a', '#7c3aed']
    },
    {
      name: 'Pastel',
      colors: ['#fef3c7', '#fce7f3', '#dbeafe', '#dcfce7', '#f3e8ff', '#fed7aa']
    },
    {
      name: 'Neon',
      colors: ['#ff0080', '#00ff41', '#00ffff', '#ff00ff', '#ffff00', '#ff8000']
    },
    {
      name: 'Earth',
      colors: ['#8b4513', '#228b22', '#4682b4', '#daa520', '#cd853f', '#708090']
    }
  ];

  const styles: Array<'round-neck' | 'polo' | 'oversized'> = ['round-neck', 'polo', 'oversized'];
  const sizes: Array<'M' | 'L' | 'XL' | 'XXL'> = ['M', 'L', 'XL', 'XXL'];
  const fonts = ['Inter', 'Roboto', 'Pacifico', 'Playfair Display', 'Arial', 'Times New Roman', 'Courier New'];
  const blendModes = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn'];
  const patterns = ['solid', 'stripes', 'dots', 'zigzag', 'waves', 'geometric'];

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: 'view',
      icon: Settings,
      label: 'View',
      description: 'Front or back view'
    },
    {
      id: 'color',
      icon: Palette,
      label: 'Color',
      description: 'T-shirt color & palettes'
    },
    {
      id: 'design',
      icon: Image,
      label: 'Design',
      description: 'Graphics & elements'
    },
    {
      id: 'text',
      icon: Type,
      label: 'Text',
      description: 'Typography & quotes'
    },
    {
      id: 'background',
      icon: Droplets,
      label: 'Background',
      description: 'Patterns & effects'
    },
    {
      id: 'preview',
      icon: Eye,
      label: 'Preview',
      description: 'Export & share'
    }
  ];

  // Update local state when config changes
  useEffect(() => {
    setView(config.view);
    setTshirtColor(config.color);
    setStyle(config.style);
    setSize(config.size);
    setCollageSize([config.collageScale * 100]);
    setQuote(config.quote);
    setShowNameLabels(config.showLabels);
  }, [config]);

  // History management
  const addToHistory = (newConfig: TShirtConfig) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newConfig);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onConfigChange(history[newIndex]);
      toast.success('Undone');
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onConfigChange(history[newIndex]);
      toast.success('Redone');
    }
  };

  // Enhanced handlers
  const handleViewChange = (newView: 'front' | 'back') => {
    setView(newView);
    const newConfig = { ...config, view: newView };
    onConfigChange(newConfig);
    addToHistory(newConfig);
  };

  const handleColorChange = (newColor: string) => {
    setTshirtColor(newColor);
    const newConfig = { ...config, color: newColor };
    onConfigChange(newConfig);
    addToHistory(newConfig);
    
    // Save to custom colors if not already saved
    if (!savedColors.includes(newColor)) {
      setSavedColors(prev => [...prev.slice(-9), newColor]); // Keep last 10
    }
  };

  const handleStyleChange = (newStyle: 'round-neck' | 'polo' | 'oversized') => {
    setStyle(newStyle);
    const newConfig = { ...config, style: newStyle };
    onConfigChange(newConfig);
    addToHistory(newConfig);
  };

  const handleSizeChange = (newSize: 'M' | 'L' | 'XL' | 'XXL') => {
    setSize(newSize);
    const newConfig = { ...config, size: newSize };
    onConfigChange(newConfig);
    addToHistory(newConfig);
  };

  const handleCollageSizeChange = (newSize: number[]) => {
    setCollageSize(newSize);
    const newConfig = { ...config, collageScale: newSize[0] / 100 };
    onConfigChange(newConfig);
    addToHistory(newConfig);
  };

  const handleQuoteChange = (newQuote: string) => {
    setQuote(newQuote);
    const newConfig = { ...config, quote: newQuote };
    onConfigChange(newConfig);
    addToHistory(newConfig);
  };

  const handleShowLabelsChange = (show: boolean) => {
    setShowNameLabels(show);
    const newConfig = { ...config, showLabels: show };
    onConfigChange(newConfig);
    addToHistory(newConfig);
  };

  // Design element handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newElement: DesignElement = {
          id: `element-${Date.now()}`,
          type: 'image',
          src: imageUrl,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          rotation: 0,
          opacity: 100,
          zIndex: designElements.length
        };
        setDesignElements(prev => [...prev, newElement]);
        setUploadedImages(prev => [...prev, imageUrl]);
        toast.success('Image uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId);
  };

  const handleElementDelete = (elementId: string) => {
    setDesignElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElement(null);
    toast.success('Element deleted');
  };

  // Text element handlers
  const handleAddText = () => {
    if (textInput.trim()) {
      const newTextElement: TextElement = {
        id: `text-${Date.now()}`,
        text: textInput,
        font: 'Inter',
        size: 16,
        color: '#000000',
        bold: false,
        italic: false,
        underline: false,
        align: 'left',
        x: 50,
        y: 50,
        rotation: 0
      };
      setTextElements(prev => [...prev, newTextElement]);
      setTextInput('');
      toast.success('Text added!');
    }
  };

  const handleTextSelect = (textId: string) => {
    setSelectedText(textId);
  };

  const handleTextDelete = (textId: string) => {
    setTextElements(prev => prev.filter(text => text.id !== textId));
    setSelectedText(null);
    toast.success('Text deleted');
  };

  // Background handlers
  const handleBackgroundTypeChange = (type: 'solid' | 'gradient' | 'pattern' | 'image') => {
    setBackgroundType(type);
    toast.success(`Background type changed to ${type}`);
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setBackgroundType('image');
        toast.success('Background image uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Export handlers
  const handleDownload = () => {
    toast.success('Design downloaded!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My T-Shirt Design',
        text: 'Check out my custom T-shirt design!',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleReset = () => {
    setDesignElements([]);
    setTextElements([]);
    setSelectedElement(null);
    setSelectedText(null);
    setBackgroundType('solid');
    setBackgroundColor('#ffffff');
    setBackgroundOpacity(100);
    toast.success('Design reset to default');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'view':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">View</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={view === 'front' ? 'default' : 'outline'}
                  onClick={() => handleViewChange('front')}
                  className="flex-1"
                >
                  Front
                </Button>
                <Button 
                  variant={view === 'back' ? 'default' : 'outline'}
                  onClick={() => handleViewChange('back')}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Preview Mode</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant={previewMode === '2d' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('2d')}
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  2D
                </Button>
                <Button 
                  variant={previewMode === '3d' ? 'default' : 'outline'}
                  onClick={() => setPreviewMode('3d')}
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  3D
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Grid</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Show Guides</Label>
                <Switch checked={showGuides} onCheckedChange={setShowGuides} />
              </div>
            </div>
          </div>
        );

      case 'color':
        return (
          <div className="space-y-6">
            {/* Quick Color Palettes */}
            <div>
              <Label className="text-sm font-medium">Quick Palettes</Label>
              <div className="space-y-3 mt-2">
                {colorPalettes.map((palette) => (
                  <div key={palette.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{palette.name}</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1">
                      {palette.colors.map((color) => (
                        <TooltipProvider key={color}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleColorChange(color)}
                                className={cn(
                                  "w-8 h-8 rounded-md border-2 transition-all",
                                  tshirtColor === color 
                                    ? "border-primary scale-110" 
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{color}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div>
              <Label className="text-sm font-medium">Custom Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  ref={colorPickerRef}
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    handleColorChange(e.target.value);
                  }}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                      handleColorChange(e.target.value);
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Saved Colors */}
            {savedColors.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Saved Colors</Label>
                <div className="grid grid-cols-6 gap-1 mt-2">
                  {savedColors.map((color) => (
                    <TooltipProvider key={color}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleColorChange(color)}
                            className={cn(
                              "w-8 h-8 rounded-md border-2 transition-all",
                              tshirtColor === color 
                                ? "border-primary scale-110" 
                                : "border-gray-300 hover:border-gray-400"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{color}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}

            {/* Style & Size */}
            <div>
              <Label className="text-sm font-medium">Style</Label>
              <div className="space-y-2 mt-2">
                {styles.map((s) => (
                  <Button
                    key={s}
                    variant={style === s ? 'default' : 'outline'}
                    onClick={() => handleStyleChange(s)}
                    className="w-full"
                  >
                    {s === 'round-neck' ? 'Round Neck' : s === 'polo' ? 'Polo' : 'Oversized'}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Size</Label>
              <div className="flex gap-2 mt-2">
                {sizes.map((s) => (
                  <Button
                    key={s}
                    variant={size === s ? 'default' : 'outline'}
                    onClick={() => handleSizeChange(s)}
                    className="flex-1"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Collage Size</Label>
              <Slider
                value={collageSize}
                onValueChange={handleCollageSizeChange}
                max={150}
                min={50}
                step={5}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{collageSize[0]}%</span>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-6">
            {/* Upload Section */}
            <div>
              <Label className="text-sm font-medium">Upload Graphics</Label>
              <div className="space-y-2 mt-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Design Elements */}
            {designElements.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Design Elements</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {designElements.map((element) => (
                    <div
                      key={element.id}
                      className={cn(
                        "p-2 border rounded-md cursor-pointer transition-all",
                        selectedElement === element.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handleElementSelect(element.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <Image className="h-4 w-4" />
                          </div>
                          <span className="text-sm">Element {element.id.slice(-4)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleElementDelete(element.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Element Controls */}
            {selectedElement && (
              <div>
                <Label className="text-sm font-medium">Element Controls</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label className="text-xs">Opacity</Label>
                    <Slider
                      value={[designElements.find(el => el.id === selectedElement)?.opacity || 100]}
                      onValueChange={([value]) => {
                        setDesignElements(prev => 
                          prev.map(el => 
                            el.id === selectedElement ? { ...el, opacity: value } : el
                          )
                        );
                      }}
                      max={100}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Rotation</Label>
                    <Slider
                      value={[designElements.find(el => el.id === selectedElement)?.rotation || 0]}
                      onValueChange={([value]) => {
                        setDesignElements(prev => 
                          prev.map(el => 
                            el.id === selectedElement ? { ...el, rotation: value } : el
                          )
                        );
                      }}
                      max={360}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="space-y-6">
            {/* Add Text */}
            <div>
              <Label className="text-sm font-medium">Add Text</Label>
              <div className="space-y-2 mt-2">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter your text..."
                  className="min-h-[60px]"
                />
                <Button onClick={handleAddText} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
              </div>
            </div>

            {/* Text Elements */}
            {textElements.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Text Elements</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {textElements.map((textElement) => (
                    <div
                      key={textElement.id}
                      className={cn(
                        "p-2 border rounded-md cursor-pointer transition-all",
                        selectedText === textElement.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handleTextSelect(textElement.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          <span className="text-sm truncate">{textElement.text}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTextDelete(textElement.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Controls */}
            {selectedText && (
              <div>
                <Label className="text-sm font-medium">Text Controls</Label>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label className="text-xs">Font</Label>
                    <Select 
                      value={textElements.find(t => t.id === selectedText)?.font || 'Inter'}
                      onValueChange={(value) => {
                        setTextElements(prev => 
                          prev.map(t => 
                            t.id === selectedText ? { ...t, font: value } : t
                          )
                        );
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Size</Label>
                    <Slider
                      value={[textElements.find(t => t.id === selectedText)?.size || 16]}
                      onValueChange={([value]) => {
                        setTextElements(prev => 
                          prev.map(t => 
                            t.id === selectedText ? { ...t, size: value } : t
                          )
                        );
                      }}
                      max={72}
                      min={8}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={textElements.find(t => t.id === selectedText)?.color || '#000000'}
                      onChange={(e) => {
                        setTextElements(prev => 
                          prev.map(t => 
                            t.id === selectedText ? { ...t, color: e.target.value } : t
                          )
                        );
                      }}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Style</Label>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={textElements.find(t => t.id === selectedText)?.bold ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setTextElements(prev => 
                            prev.map(t => 
                              t.id === selectedText ? { ...t, bold: !t.bold } : t
                            )
                          );
                        }}
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={textElements.find(t => t.id === selectedText)?.italic ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setTextElements(prev => 
                            prev.map(t => 
                              t.id === selectedText ? { ...t, italic: !t.italic } : t
                            )
                          );
                        }}
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={textElements.find(t => t.id === selectedText)?.underline ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setTextElements(prev => 
                            prev.map(t => 
                              t.id === selectedText ? { ...t, underline: !t.underline } : t
                            )
                          );
                        }}
                      >
                        <Underline className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Alignment</Label>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={textElements.find(t => t.id === selectedText)?.align === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setTextElements(prev => 
                            prev.map(t => 
                              t.id === selectedText ? { ...t, align: 'left' } : t
                            )
                          );
                        }}
                      >
                        <AlignLeft className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={textElements.find(t => t.id === selectedText)?.align === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setTextElements(prev => 
                            prev.map(t => 
                              t.id === selectedText ? { ...t, align: 'center' } : t
                            )
                          );
                        }}
                      >
                        <AlignCenter className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={textElements.find(t => t.id === selectedText)?.align === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setTextElements(prev => 
                            prev.map(t => 
                              t.id === selectedText ? { ...t, align: 'right' } : t
                            )
                          );
                        }}
                      >
                        <AlignRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quote Section */}
            <div>
              <Label className="text-sm font-medium">Optional Quote</Label>
              <Textarea
                value={quote}
                onChange={(e) => handleQuoteChange(e.target.value)}
                placeholder="Add a memorable quote..."
                className="mt-2 min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Name Labels</Label>
              <Switch
                checked={showNameLabels}
                onCheckedChange={handleShowLabelsChange}
              />
            </div>
          </div>
        );

      case 'background':
        return (
          <div className="space-y-6">
            {/* Background Type */}
            <div>
              <Label className="text-sm font-medium">Background Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={backgroundType === 'solid' ? 'default' : 'outline'}
                  onClick={() => handleBackgroundTypeChange('solid')}
                  size="sm"
                >
                  Solid
                </Button>
                <Button
                  variant={backgroundType === 'gradient' ? 'default' : 'outline'}
                  onClick={() => handleBackgroundTypeChange('gradient')}
                  size="sm"
                >
                  Gradient
                </Button>
                <Button
                  variant={backgroundType === 'pattern' ? 'default' : 'outline'}
                  onClick={() => handleBackgroundTypeChange('pattern')}
                  size="sm"
                >
                  Pattern
                </Button>
                <Button
                  variant={backgroundType === 'image' ? 'default' : 'outline'}
                  onClick={() => handleBackgroundTypeChange('image')}
                  size="sm"
                >
                  Image
                </Button>
              </div>
            </div>

            {/* Solid Background */}
            {backgroundType === 'solid' && (
              <div>
                <Label className="text-sm font-medium">Background Color</Label>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            {/* Gradient Background */}
            {backgroundType === 'gradient' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Gradient Colors</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={backgroundGradient.from}
                      onChange={(e) => setBackgroundGradient(prev => ({ ...prev, from: e.target.value }))}
                    />
                    <Input
                      type="color"
                      value={backgroundGradient.to}
                      onChange={(e) => setBackgroundGradient(prev => ({ ...prev, to: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Gradient Angle</Label>
                  <Slider
                    value={[backgroundGradient.angle]}
                    onValueChange={([value]) => setBackgroundGradient(prev => ({ ...prev, angle: value }))}
                    max={360}
                    min={0}
                    className="mt-2"
                  />
                </div>
              </div>
            )}

            {/* Pattern Background */}
            {backgroundType === 'pattern' && (
              <div>
                <Label className="text-sm font-medium">Pattern Style</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {patterns.map((pattern) => (
                    <Button
                      key={pattern}
                      variant="outline"
                      size="sm"
                      className="h-12"
                    >
                      {pattern}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Background */}
            {backgroundType === 'image' && (
              <div>
                <Label className="text-sm font-medium">Background Image</Label>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Background
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Background Controls */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Opacity</Label>
                <Slider
                  value={[backgroundOpacity]}
                  onValueChange={([value]) => setBackgroundOpacity(value)}
                  max={100}
                  min={0}
                  className="mt-2"
                />
                <span className="text-xs text-muted-foreground">{backgroundOpacity}%</span>
              </div>

              <div>
                <Label className="text-sm font-medium">Blend Mode</Label>
                <Select value={backgroundBlendMode} onValueChange={setBackgroundBlendMode}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blendModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            {/* Preview Controls */}
            <div>
              <Label className="text-sm font-medium">Preview Controls</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 3D Preview Controls */}
            <div>
              <Label className="text-sm font-medium">3D Rotation</Label>
              <Slider
                value={[previewRotation]}
                onValueChange={([value]) => setPreviewRotation(value)}
                max={360}
                min={0}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{previewRotation}°</span>
            </div>

            {/* Export Options */}
            <div>
              <Label className="text-sm font-medium">Export & Share</Label>
              <div className="space-y-2 mt-2">
                <Button
                  onClick={handleDownload}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Design
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Design
                </Button>
              </div>
            </div>

            {/* Design Summary */}
            <div>
              <Label className="text-sm font-medium">Design Summary</Label>
              <div className="space-y-2 mt-2 p-3 bg-muted/50 rounded-md">
                <div className="text-xs space-y-1">
                  <p>Style: {style} • Size: {size} • Color: {tshirtColor}</p>
                  <p>View: {view} • Elements: {designElements.length}</p>
                  <p>Text Elements: {textElements.length}</p>
                  {quote && <p>Quote: "{quote.substring(0, 30)}..."</p>}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full h-[calc(100vh-100px)] bg-background border-2 rounded-lg flex">
        {/* Tab Icons Sidebar */}
        <div className="w-1/4 bg-muted/20 border-r border-border p-6">
          <div className="space-y-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full h-25 flex flex-col items-center gap-1 p-2 rounded-md px-6 py-4 border-2 border-border relative transition-all",
                        activeTab === tab.id
                          ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-md"
                          : "bg-background hover:bg-accent text-muted-foreground hover:text-white"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{tab.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tab.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex-1 flex flex-col">
            <div className="pb-3 border-b border-border">
              <h3 className="text-lg font-semibold">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
            
            <div className="flex-1 overflow-auto pt-4">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
