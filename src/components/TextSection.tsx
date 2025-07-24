
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Palette,
  Sparkles,
  Save,
  Trash2,
  RotateCw,
  Zap,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TextTemplate {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  textAlign: string;
  color: string;
  effects: string[];
}

const fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Calibri', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins',
  'Playfair Display', 'Merriweather', 'Lato', 'Oswald', 'Raleway'
];

const textEffects = [
  { id: 'shadow', name: 'Shadow', icon: Eye },
  { id: 'outline', name: 'Outline', icon: EyeOff },
  { id: 'gradient', name: 'Gradient', icon: Palette },
  { id: '3d', name: '3D', icon: Zap },
  { id: 'glow', name: 'Glow', icon: Sparkles },
  { id: 'curve', name: 'Curve', icon: RotateCw },
];

export const TextSection = () => {
  const [textContent, setTextContent] = useState('');
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [fontSize, setFontSize] = useState([24]);
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState('left');
  const [textColor, setTextColor] = useState('#000000');
  const [letterSpacing, setLetterSpacing] = useState([0]);
  const [lineHeight, setLineHeight] = useState([1.2]);
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<TextTemplate[]>([
    {
      id: '1',
      name: 'Heading Style',
      fontFamily: 'Montserrat',
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#1f2937',
      effects: ['shadow']
    },
    {
      id: '2',
      name: 'Subtitle Style',
      fontFamily: 'Open Sans',
      fontSize: 18,
      fontWeight: 'normal',
      textAlign: 'left',
      color: '#6b7280',
      effects: []
    }
  ]);

  const handleAddText = useCallback((type: 'heading' | 'subheading' | 'body') => {
    const defaultText = {
      heading: 'Your Heading',
      subheading: 'Your Subheading',
      body: 'Your text content here'
    };
    
    setTextContent(defaultText[type]);
    
    const sizes = { heading: 32, subheading: 24, body: 16 };
    const weights = { heading: 'bold', subheading: '600', body: 'normal' };
    
    setFontSize([sizes[type]]);
    setFontWeight(weights[type]);
    
    toast({
      title: "Text Added",
      description: `${type} text added to canvas`,
    });
  }, []);

  const handleStyleToggle = useCallback((style: string) => {
    switch (style) {
      case 'bold':
        setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold');
        break;
      case 'italic':
        // Handle italic toggle
        break;
      case 'underline':
        // Handle underline toggle
        break;
    }
  }, [fontWeight]);

  const handleAlignment = useCallback((align: string) => {
    setTextAlign(align);
  }, []);

  const toggleEffect = useCallback((effectId: string) => {
    setActiveEffects(prev => 
      prev.includes(effectId) 
        ? prev.filter(id => id !== effectId)
        : [...prev, effectId]
    );
  }, []);

  const saveTemplate = useCallback(() => {
    if (!textContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text first",
        variant: "destructive",
      });
      return;
    }

    const newTemplate: TextTemplate = {
      id: Date.now().toString(),
      name: `Custom Style ${savedTemplates.length + 1}`,
      fontFamily: selectedFont,
      fontSize: fontSize[0],
      fontWeight,
      textAlign,
      color: textColor,
      effects: activeEffects
    };

    setSavedTemplates(prev => [...prev, newTemplate]);
    
    toast({
      title: "Template Saved",
      description: "Text style saved as template",
    });
  }, [textContent, selectedFont, fontSize, fontWeight, textAlign, textColor, activeEffects, savedTemplates.length]);

  const applyTemplate = useCallback((template: TextTemplate) => {
    setSelectedFont(template.fontFamily);
    setFontSize([template.fontSize]);
    setFontWeight(template.fontWeight);
    setTextAlign(template.textAlign);
    setTextColor(template.color);
    setActiveEffects(template.effects);
    
    toast({
      title: "Template Applied",
      description: `${template.name} applied to text`,
    });
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setSavedTemplates(prev => prev.filter(t => t.id !== templateId));
    
    toast({
      title: "Template Deleted",
      description: "Text template removed",
    });
  }, []);

  const colorPresets = [
    '#000000', '#ffffff', '#ef4444', '#3b82f6', '#10b981', 
    '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
  ];

  return (
    <div className="space-y-4">
      {/* Quick Add Text */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Add Text</h4>
        <div className="grid gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleAddText('heading')}
          >
            <Type className="w-4 h-4 mr-2" />
            Add Heading
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleAddText('subheading')}
          >
            <Type className="w-4 h-4 mr-2" />
            Add Subheading
          </Button>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleAddText('body')}
          >
            <Type className="w-4 h-4 mr-2" />
            Add Body Text
          </Button>
        </div>
      </div>

      <Separator />

      {/* Text Input */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Text Content</h4>
        <Input
          placeholder="Enter your text..."
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
        />
      </div>

      {/* Font Selection */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Font</h4>
        <Select value={selectedFont} onValueChange={setSelectedFont}>
          <SelectTrigger>
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map(font => (
              <SelectItem key={font} value={font}>
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Font Size</label>
          <span className="text-xs text-muted-foreground">{fontSize[0]}px</span>
        </div>
        <Slider
          value={fontSize}
          onValueChange={setFontSize}
          max={72}
          min={8}
          step={1}
          className="w-full"
        />
      </div>

      {/* Text Styles */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Styles</h4>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStyleToggle('bold')}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStyleToggle('italic')}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStyleToggle('underline')}
          >
            <Underline className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Alignment</h4>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant={textAlign === 'left' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignment('left')}
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={textAlign === 'center' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignment('center')}
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            variant={textAlign === 'right' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignment('right')}
          >
            <AlignRight className="w-4 h-4" />
          </Button>
          <Button
            variant={textAlign === 'justify' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleAlignment('justify')}
          >
            <AlignJustify className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Color */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Color</h4>
        <div className="flex gap-2 mb-2">
          {colorPresets.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${
                textColor === color ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setTextColor(color)}
            />
          ))}
        </div>
        <Input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="w-full h-8"
        />
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Letter Spacing</label>
            <span className="text-xs text-muted-foreground">{letterSpacing[0]}px</span>
          </div>
          <Slider
            value={letterSpacing}
            onValueChange={setLetterSpacing}
            max={10}
            min={-2}
            step={0.1}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Line Height</label>
            <span className="text-xs text-muted-foreground">{lineHeight[0]}</span>
          </div>
          <Slider
            value={lineHeight}
            onValueChange={setLineHeight}
            max={3}
            min={0.5}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>

      {/* Text Effects */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Effects</h4>
        <div className="grid grid-cols-3 gap-2">
          {textEffects.map((effect) => {
            const Icon = effect.icon;
            return (
              <Button
                key={effect.id}
                variant={activeEffects.includes(effect.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleEffect(effect.id)}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Icon className="w-3 h-3" />
                <span className="text-xs">{effect.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Templates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Templates</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={saveTemplate}
            disabled={!textContent.trim()}
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {savedTemplates.map((template) => (
            <Card key={template.id} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium">{template.name}</h5>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="h-6 px-2"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                    className="h-6 px-2 text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {template.fontFamily} • {template.fontSize}px • {template.fontWeight}
              </div>
              <div className="flex gap-1 mt-1">
                {template.effects.map(effect => (
                  <Badge key={effect} variant="secondary" className="text-xs">
                    {effect}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
