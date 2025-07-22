import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, RotateCw } from 'lucide-react';

interface TshirtPreviewProps {
  designUrl?: string;
}

export const TshirtPreview = ({ designUrl }: TshirtPreviewProps) => {
  const [view, setView] = useState<'front' | 'back'>('front');

  return (
    <Card className="p-6 bg-gradient-card shadow-elegant">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">T-Shirt Preview</h3>
          <div className="flex gap-2">
            <Button
              variant={view === 'front' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('front')}
            >
              Front
            </Button>
            <Button
              variant={view === 'back' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('back')}
            >
              Back
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center items-center min-h-[400px] bg-muted/30 rounded-lg">
          {/* T-shirt Base */}
          <div className="relative">
            <img
              src="/lovable-uploads/daa84bd7-cc62-4500-9a32-f2a7e0cfb145.png"
              alt="White T-shirt"
              className="w-80 h-auto object-contain"
            />
            
            {/* Design Overlay */}
            {designUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-48 h-48 bg-cover bg-center bg-no-repeat opacity-90"
                  style={{
                    backgroundImage: `url(${designUrl})`,
                    transform: 'perspective(800px) rotateY(-5deg)',
                    borderRadius: '8px',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {view === 'front' ? 'Front View' : 'Back View'} • Premium Cotton Blend
        </div>
      </div>
    </Card>
  );
};