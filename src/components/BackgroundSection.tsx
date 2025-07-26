
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Upload, Grid, Image as ImageIcon } from 'lucide-react';

export interface BackgroundSectionProps {
  fabricCanvas?: any | null;
  backgroundType: 'color' | 'gradient' | 'pattern' | 'image';
  setBackgroundType: (type: 'color' | 'gradient' | 'pattern' | 'image') => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  backgroundGradient: any;
  setBackgroundGradient: (gradient: any) => void;
  backgroundPattern: any;
  setBackgroundPattern: (pattern: any) => void;
  backgroundOpacity: number[];
  setBackgroundOpacity: (opacity: number[]) => void;
  backgroundBlur: number[];
  setBackgroundBlur: (blur: number[]) => void;
  uploadedBackgrounds: string[];
  setUploadedBackgrounds: (urls: string[]) => void;
  selectedBackgroundImage: string;
  setSelectedBackgroundImage: (url: string) => void;
}

export const BackgroundSection: React.FC<BackgroundSectionProps> = ({
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
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Background
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={backgroundType} onValueChange={(value) => setBackgroundType(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="color">Color</TabsTrigger>
            <TabsTrigger value="gradient">Gradient</TabsTrigger>
            <TabsTrigger value="pattern">Pattern</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="color" className="space-y-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gradient" className="space-y-4">
            <div className="space-y-2">
              <Label>Gradient Colors</Label>
              {Array.isArray(backgroundGradient) && backgroundGradient.map((color, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newGradient = [...backgroundGradient];
                      newGradient[index] = e.target.value;
                      setBackgroundGradient(newGradient);
                    }}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => {
                      const newGradient = [...backgroundGradient];
                      newGradient[index] = e.target.value;
                      setBackgroundGradient(newGradient);
                    }}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pattern" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {['none', 'dots', 'lines', 'grid', 'diagonal', 'waves'].map((pattern) => (
                <Button
                  key={pattern}
                  variant={backgroundPattern === pattern ? "default" : "outline"}
                  onClick={() => setBackgroundPattern(pattern)}
                  className="h-12 capitalize"
                >
                  {pattern}
                </Button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const url = e.target?.result as string;
                          setSelectedBackgroundImage(url);
                          setUploadedBackgrounds([...uploadedBackgrounds, url]);
                        };
                        reader.readAsDataURL(file);
                      }
                    };
                    input.click();
                  }}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
              </div>
              {selectedBackgroundImage && (
                <div className="mt-2">
                  <img
                    src={selectedBackgroundImage}
                    alt="Background preview"
                    className="w-full h-20 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
