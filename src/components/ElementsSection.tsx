
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Circle, 
  Square, 
  Triangle, 
  Star, 
  Heart, 
  Hexagon,
  Home,
  Mail,
  Phone,
  Camera,
  Music,
  Palette,
  Layers,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ArrowUp,
  ArrowDown,
  Grid3X3,
  Zap,
  Crown,
  Smile,
  Sun,
  Moon,
  Cloud,
  Flower,
  Leaf,
  Gift
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ElementCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  elements: {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    category: string;
  }[];
}

const elementCategories: ElementCategory[] = [
  {
    id: 'shapes',
    name: 'Shapes',
    icon: Circle,
    elements: [
      { id: 'circle', name: 'Circle', icon: Circle, category: 'shapes' },
      { id: 'square', name: 'Square', icon: Square, category: 'shapes' },
      { id: 'triangle', name: 'Triangle', icon: Triangle, category: 'shapes' },
      { id: 'star', name: 'Star', icon: Star, category: 'shapes' },
      { id: 'heart', name: 'Heart', icon: Heart, category: 'shapes' },
      { id: 'hexagon', name: 'Hexagon', icon: Hexagon, category: 'shapes' },
    ]
  },
  {
    id: 'icons',
    name: 'Icons',
    icon: Home,
    elements: [
      { id: 'home', name: 'Home', icon: Home, category: 'icons' },
      { id: 'mail', name: 'Mail', icon: Mail, category: 'icons' },
      { id: 'phone', name: 'Phone', icon: Phone, category: 'icons' },
      { id: 'camera', name: 'Camera', icon: Camera, category: 'icons' },
      { id: 'music', name: 'Music', icon: Music, category: 'icons' },
      { id: 'palette', name: 'Palette', icon: Palette, category: 'icons' },
    ]
  },
  {
    id: 'stickers',
    name: 'Stickers',
    icon: Smile,
    elements: [
      { id: 'smile', name: 'Smile', icon: Smile, category: 'stickers' },
      { id: 'crown', name: 'Crown', icon: Crown, category: 'stickers' },
      { id: 'zap', name: 'Zap', icon: Zap, category: 'stickers' },
      { id: 'gift', name: 'Gift', icon: Gift, category: 'stickers' },
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: Leaf,
    elements: [
      { id: 'sun', name: 'Sun', icon: Sun, category: 'nature' },
      { id: 'moon', name: 'Moon', icon: Moon, category: 'nature' },
      { id: 'cloud', name: 'Cloud', icon: Cloud, category: 'nature' },
      { id: 'flower', name: 'Flower', icon: Flower, category: 'nature' },
      { id: 'leaf', name: 'Leaf', icon: Leaf, category: 'nature' },
    ]
  }
];

export const ElementsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementColor, setElementColor] = useState('#3b82f6');
  const [elementOpacity, setElementOpacity] = useState([100]);

  const allElements = elementCategories.flatMap(cat => cat.elements);
  
  const filteredElements = allElements.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || element.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleElementClick = useCallback((elementId: string) => {
    setSelectedElement(elementId);
    toast({
      title: "Element Added",
      description: "Element added to canvas",
    });
  }, []);

  const handleTransform = useCallback((action: string) => {
    if (!selectedElement) return;
    
    toast({
      title: "Transform Applied",
      description: `${action} applied to element`,
    });
  }, [selectedElement]);

  const colorPresets = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#f97316', '#06b6d4', '#84cc16', '#ec4899', '#6b7280'
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search elements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filters */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Categories</h4>
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="h-7 text-xs"
          >
            All
          </Button>
          {elementCategories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-7 text-xs"
            >
              <category.icon className="w-3 h-3 mr-1" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Elements Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Elements</h4>
          <Badge variant="secondary" className="text-xs">
            {filteredElements.length}
          </Badge>
        </div>
        
        <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
          {filteredElements.map((element) => {
            const Icon = element.icon;
            return (
              <Button
                key={element.id}
                variant={selectedElement === element.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleElementClick(element.id)}
                className="aspect-square p-2 flex flex-col items-center gap-1"
                title={element.name}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs truncate">{element.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Element Customization */}
      {selectedElement && (
        <Card className="p-4 space-y-4">
          <h4 className="text-sm font-medium">Customize Element</h4>
          
          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Color</label>
            <div className="flex gap-2 mb-2">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    elementColor === color ? 'border-primary' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setElementColor(color)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={elementColor}
              onChange={(e) => setElementColor(e.target.value)}
              className="w-full h-8"
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Opacity</label>
              <span className="text-xs text-muted-foreground">{elementOpacity[0]}%</span>
            </div>
            <Slider
              value={elementOpacity}
              onValueChange={setElementOpacity}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Transform Controls */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium">Transform</h5>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransform('Rotate')}
                className="flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                Rotate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransform('Flip H')}
                className="flex items-center gap-1"
              >
                <FlipHorizontal className="w-3 h-3" />
                Flip H
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransform('Flip V')}
                className="flex items-center gap-1"
              >
                <FlipVertical className="w-3 h-3" />
                Flip V
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransform('Duplicate')}
                className="flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                Copy
              </Button>
            </div>
          </div>

          {/* Layering */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium">Layering</h5>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransform('Bring Forward')}
                className="flex items-center gap-1"
              >
                <ArrowUp className="w-3 h-3" />
                Forward
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTransform('Send Back')}
                className="flex items-center gap-1"
              >
                <ArrowDown className="w-3 h-3" />
                Back
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
