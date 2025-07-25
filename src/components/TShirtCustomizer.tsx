import React, { useState, useEffect } from 'react';
import { 
  Upload, Type, Star, Move, Shirt, Settings, Copy, RotateCcw,
  Palette, Grid3X3, Users, FileText, Layers, Zap
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
import { BackgroundSection } from './BackgroundSection';

interface TShirtCustomizerProps {
  config: TShirtConfig;
  onConfigChange: (config: TShirtConfig) => void;
}

type TabType = 'view' | 'color' | 'style' | 'background' | 'quote' | 'badge' | 'position' | 'material';

interface TabConfig {
  id: TabType;
  icon: React.ElementType;
  label: string;
  description: string;
}

export const TShirtCustomizer: React.FC<TShirtCustomizerProps> = ({ 
  config,
  onConfigChange
 }) => {
  // State for various customization options - initialize with config values
  const [view, setView] = useState<'front' | 'back'>(config.view);
  const [tshirtColor, setTshirtColor] = useState(config.color);
  const [style, setStyle] = useState<'round-neck' | 'polo' | 'oversized'>(config.style);
  const [size, setSize] = useState<'M' | 'L' | 'XL' | 'XXL'>(config.size);
  const [collageSize, setCollageSize] = useState([config.collageScale * 100]);
  const [quote, setQuote] = useState(config.quote);
  const [showNameLabels, setShowNameLabels] = useState(config.showLabels);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontBold, setFontBold] = useState(false);
  const [fontItalic, setFontItalic] = useState(false);
  const [fontUnderline, setFontUnderline] = useState(false);
  const [quoteColor, setQuoteColor] = useState('#000000');
  const [highlightMember, setHighlightMember] = useState('');
  const [badgeType, setBadgeType] = useState('Farewell Star');
  const [positionX, setPositionX] = useState([50]);
  const [positionY, setPositionY] = useState([50]);
  const [material, setMaterial] = useState('Cotton');

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('view');

  const colors = ['#ffffff', '#000000', '#1f2937', '#dc2626', '#16a34a', '#7c3aed'];
  const styles: Array<'round-neck' | 'polo' | 'oversized'> = ['round-neck', 'polo', 'oversized'];
  const sizes: Array<'M' | 'L' | 'XL' | 'XXL'> = ['M', 'L', 'XL', 'XXL'];
  const fonts = ['Inter', 'Roboto', 'Pacifico', 'Playfair Display'];
  const badges = ['Farewell Star', 'Captain', 'MVP', 'Team Leader'];
  const materials = ['Cotton', 'Dri-fit', 'Heavyweight'];
  const mockMembers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];

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
      description: 'T-shirt color'
    },
    {
      id: 'style',
      icon: Shirt,
      label: 'Style',
      description: 'Style and size'
    },
    {
      id: 'background',
      icon: Upload,
      label: 'Background',
      description: 'Background image'
    },
    {
      id: 'quote',
      icon: Type,
      label: 'Quote',
      description: 'Text and quotes'
    },
    {
      id: 'badge',
      icon: Star,
      label: 'Badge',
      description: 'Badges and highlights'
    },
    {
      id: 'position',
      icon: Move,
      label: 'Position',
      description: 'Position controls'
    },
    {
      id: 'material',
      icon: Layers,
      label: 'Material',
      description: 'Shirt material'
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

  const handleViewChange = (newView: 'front' | 'back') => {
    setView(newView);
    onConfigChange({ ...config, view: newView });
  };

  const handleColorChange = (newColor: string) => {
    setTshirtColor(newColor);
    onConfigChange({ ...config, color: newColor });
  };

  const handleStyleChange = (newStyle: 'round-neck' | 'polo' | 'oversized') => {
    setStyle(newStyle);
    onConfigChange({ ...config, style: newStyle });
  };

  const handleSizeChange = (newSize: 'M' | 'L' | 'XL' | 'XXL') => {
    setSize(newSize);
    onConfigChange({ ...config, size: newSize });
  };

  const handleCollageSizeChange = (newSize: number[]) => {
    setCollageSize(newSize);
    onConfigChange({ ...config, collageScale: newSize[0] / 100 });
  };

  const handleQuoteChange = (newQuote: string) => {
    setQuote(newQuote);
    onConfigChange({ ...config, quote: newQuote });
  };

  const handleShowLabelsChange = (show: boolean) => {
    setShowNameLabels(show);
    onConfigChange({ ...config, showLabels: show });
  };

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      toast.success('Background image uploaded!');
    }
  };

  const resetPosition = () => {
    setPositionX([50]);
    setPositionY([50]);
    toast.success('Collage centered!');
  };

  const copyConfig = () => {
    const config = {
      view,
      tshirtColor,
      style,
      size,
      collageSize: collageSize[0],
      quote,
      showNameLabels,
      fontFamily,
      fontBold,
      fontItalic,
      fontUnderline,
      quoteColor,
      highlightMember,
      badgeType,
      positionX: positionX[0],
      positionY: positionY[0],
      material,
      backgroundImage: backgroundImage?.name || null
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('Configuration copied to clipboard!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'view':
        return (
          <div className="space-y-4">
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
          </div>
        );

      case 'color':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">T-Shirt Color</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={cn(
                      "w-12 h-12 rounded-md border-2 transition-all",
                      tshirtColor === color 
                        ? "border-primary scale-110" 
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {/* <BackgroundSection /> */}
            </div>
          </div>
        );

      case 'style':
        return (
          <div className="space-y-4">
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

      case 'background':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Background Image</Label>
              <Input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleBackgroundUpload}
                className="mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {backgroundImage && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {backgroundImage.name} uploaded
                </p>
              )}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Optional Quote</Label>
              <Textarea
                value={quote}
                onChange={(e) => handleQuoteChange(e.target.value)}
                placeholder="Add a memorable quote..."
                className="mt-2 min-h-[80px]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Font</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="mt-2">
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
              <Label className="text-sm font-medium">Text Style</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={fontBold ? 'default' : 'outline'}
                  onClick={() => setFontBold(!fontBold)}
                  size="sm"
                >
                  Bold
                </Button>
                <Button
                  variant={fontItalic ? 'default' : 'outline'}
                  onClick={() => setFontItalic(!fontItalic)}
                  size="sm"
                >
                  Italic
                </Button>
                <Button
                  variant={fontUnderline ? 'default' : 'outline'}
                  onClick={() => setFontUnderline(!fontUnderline)}
                  size="sm"
                >
                  Underline
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Text Color</Label>
              <Input
                type="color"
                value={quoteColor}
                onChange={(e) => setQuoteColor(e.target.value)}
                className="mt-2 w-full h-10"
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

      case 'badge':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Badge Type</Label>
              <Select value={badgeType} onValueChange={setBadgeType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {badges.map((badge) => (
                    <SelectItem key={badge} value={badge}>
                      {badge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Highlight Member</Label>
              <Select value={highlightMember} onValueChange={setHighlightMember}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select member to highlight" />
                </SelectTrigger>
                <SelectContent>
                  {mockMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {highlightMember && (
              <Badge variant="secondary" className="mt-2">
                {highlightMember} - {badgeType}
              </Badge>
            )}
          </div>
        );

      case 'position':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">X Position</Label>
              <Slider
                value={positionX}
                onValueChange={setPositionX}
                max={100}
                min={0}
                step={1}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{positionX[0]}%</span>
            </div>

            <div>
              <Label className="text-sm font-medium">Y Position</Label>
              <Slider
                value={positionY}
                onValueChange={setPositionY}
                max={100}
                min={0}
                step={1}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{positionY[0]}%</span>
            </div>

            <Button 
              variant="outline" 
              onClick={resetPosition}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Center
            </Button>
          </div>
        );

      case 'material':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Shirt Material</Label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {materials.map((mat) => (
                    <SelectItem key={mat} value={mat}>
                      {mat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] bg-background border-2 rounded-lg flex">
      {/* Tab Icons Sidebar */}
      <div className="w-1/4 bg-muted/20 border-r border-border p-6">
      <div className="space-y-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full h-25 flex flex-col items-center gap-1 p-2 rounded-md px-6 py-4 border-2 border-border relative",
                activeTab === tab.id
                  ? "bg-gradient-primary text-white shadow-md"
                  : "bg-background hover:bg-accent text-black-700 hover:text-white"
              )}
              title={tab.label}
            >
              <Icon className="h-5 w-5" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>
      </div>

      {/* Content Panel */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex-1 flex flex-col">
          <div className="pb-3">
            <h3 className="text-lg">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
          
          <div className="flex-1 overflow-auto">
            {renderTabContent()}
          </div>

          
        </div>
      </div>
    </div>
  );
};
