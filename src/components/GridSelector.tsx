
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hexagon, Grid3X3, Circle, Focus } from 'lucide-react';
import { GridType } from './GridTemplates';

interface GridSelectorProps {
  selectedGrid: GridType | null;
  onGridSelect: (gridType: GridType) => void;
  onShowGrid: () => void;
  onClearGrid: () => void;
  isGridVisible: boolean;
}

export const GridSelector = ({ 
  selectedGrid, 
  onGridSelect, 
  onShowGrid, 
  onClearGrid, 
  isGridVisible 
}: GridSelectorProps) => {
  const gridTemplates = [
    { type: 'hexagonal' as GridType, label: 'Hexagonal', icon: Hexagon },
    { type: 'square' as GridType, label: 'Square Grid', icon: Grid3X3 },
    { type: 'circular' as GridType, label: 'Circular', icon: Circle },
    { type: 'center-focus' as GridType, label: 'Center Focus', icon: Focus },
  ];

  return (
    <Card className="p-4 bg-gradient-card">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Choose Grid Template</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {gridTemplates.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={selectedGrid === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onGridSelect(type)}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          <Button 
            variant="creative" 
            size="sm"
            onClick={onShowGrid}
            disabled={!selectedGrid}
          >
            Show Grid
          </Button>
          {isGridVisible && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearGrid}
            >
              Clear Grid
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
