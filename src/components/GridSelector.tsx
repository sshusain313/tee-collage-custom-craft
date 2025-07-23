
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Hexagon, Grid3X3, Circle, Focus, Plus, Minus } from 'lucide-react';
import { GridType } from './GridTemplates';
import { DesignSidebar } from './DesignSidebar';
import { SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import { Upload, Star } from 'lucide-react';  

interface GridSelectorProps {
  selectedGrid: GridType | null;
  onGridSelect: (gridType: GridType) => void;
  onShowGrid: () => void;
  onClearGrid: () => void;
  isGridVisible: boolean;
  hexColumns?: number;
  hexRows?: number;
  squareRows?: number;
  squareColumns?: number;
  circleCount?: number;
  focusCount?: number;
  onHexColumnsChange?: (columns: number) => void;
  onHexRowsChange?: (rows: number) => void;
  onSquareRowsChange?: (rows: number) => void;
  onSquareColumnsChange?: (columns: number) => void;
  onCircleCountChange?: (count: number) => void;
  onFocusCountChange?: (count: number) => void;
}

export const GridSelector = ({ 
  selectedGrid, 
  onGridSelect, 
  onShowGrid, 
  onClearGrid, 
  isGridVisible,
  hexColumns = 8,
  hexRows = 8,
  squareRows = 8,
  squareColumns = 8,
  circleCount = 8,
  focusCount = 8,
  onHexColumnsChange,
  onHexRowsChange,
  onSquareRowsChange,
  onSquareColumnsChange,
  onCircleCountChange,
  onFocusCountChange
}: GridSelectorProps) => {
  const gridTemplates = [
    { type: 'hexagonal' as GridType, label: 'Hexagonal', icon: Hexagon },
    { type: 'square' as GridType, label: 'Square Grid', icon: Grid3X3 },
    { type: 'center-focus' as GridType, label: 'Center Focus', icon: Focus },
  ];

  const handleColumnChange = (increment: boolean) => {
    if (!onHexColumnsChange) return;
    const newColumns = increment 
      ? Math.min(hexColumns + 1, 16) 
      : Math.max(hexColumns - 1, 3);
    onHexColumnsChange(newColumns);
  };

  const handleRowChange = (increment: boolean) => {
    if(!onHexRowsChange) return;
    const newRows=increment
      ? Math.min(hexRows + 1, 16)
      : Math.max(hexRows - 1, 3);
    onHexRowsChange(newRows);
  };

  const handleSquareRowsChange = (increment: boolean) => {
    if (!onSquareRowsChange || squareRows === undefined) return;
    const newRows = increment
      ? Math.min(squareRows + 1, 16)
      : Math.max(squareRows - 1, 2);
    onSquareRowsChange(newRows);
  };

  const handleSquareColumnsChange = (increment: boolean) => {
    if (!onSquareColumnsChange || squareColumns === undefined) return;
    const newColumns = increment
      ? Math.min(squareColumns + 1, 16)
      : Math.max(squareColumns - 1, 2);
    onSquareColumnsChange(newColumns);
  };

  const handleCircleCountChange = (increment: boolean) => {
    if (!onCircleCountChange || circleCount === undefined) return;
    const newCount = increment
      ? Math.min(circleCount + 1, 32)
      : Math.max(circleCount - 1, 1);
    onCircleCountChange(newCount);
  };

  const handleFocusCountChange = (increment: boolean) => {
    if (!onFocusCountChange || focusCount === undefined) return;
    const newCount = increment
      ? Math.min(focusCount + 1, 16)
      : Math.max(focusCount - 1, 1);
    onFocusCountChange(newCount);
  };

  return (
    <Card className="p-4 bg-gradient-card">
      <div className="space-y-4">
        {/* <h3 className="text-sm font-medium text-foreground">Choose Grid Template</h3> */}
        
        <div className="flex flex-col gap-2">
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

        {/* Hexagonal Grid Column/Row Control */}
        {selectedGrid === 'hexagonal' && (
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground">Columns:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleColumnChange(false)}
              disabled={hexColumns <= 3}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-sm font-medium min-w-[20px] text-center">
              {hexColumns}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleColumnChange(true)}
              disabled={hexColumns >= 16}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <span className='text-xs text-muted-foreground'>Rows:</span>
            <Button 
              variant='outline'
              size='icon'
              className='h-6 w-6'
              onClick={() => handleRowChange(false)}
              disabled={hexRows <= 3}
              >
                <Minus className='w-3 h-3' />
              </Button>
              <span className='text-sm font-medium min-w-[20px] text-center'>
                {hexRows}
              </span>
              <Button 
                variant='outline'
                size='icon'
                className='h-6 w-6'
                onClick={()=>handleRowChange(true)}
                disabled={hexRows >=16}
                >
                  <Plus className='w-3 h-3' />
                </Button>
          </div>
        )}
        {/* Square Grid Row/Column Control */}
        {selectedGrid === 'square' && (
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground">Rows:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleSquareRowsChange(false)}
              disabled={squareRows <= 2}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-sm font-medium min-w-[20px] text-center">
              {squareRows}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleSquareRowsChange(true)}
              disabled={squareRows >= 16}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <span className="text-xs text-muted-foreground">Columns:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleSquareColumnsChange(false)}
              disabled={squareColumns <= 2}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-sm font-medium min-w-[20px] text-center">
              {squareColumns}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleSquareColumnsChange(true)}
              disabled={squareColumns >= 16}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}
        {/* Center Focus Grid Count Control */}
        {selectedGrid === 'center-focus' && (
          <div className="flex items-center justify-center gap-2 p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground">Circles:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleFocusCountChange(false)}
              disabled={focusCount <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-sm font-medium min-w-[20px] text-center">
              {focusCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleFocusCountChange(true)}
              disabled={focusCount >= 16}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        )}

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

        <SidebarGroup>
              <SidebarGroupLabel className="text-purple-700 font-semibold">Quick Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2">
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white h-10">
                    <Upload className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Upload Photos</span>
                  </Button>
                  <Button variant="outline" className="w-full h-10 border-purple-300 text-purple-700 hover:bg-purple-50">
                    <Star className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">My Favorites</span>
                  </Button>
                </div>
              </SidebarGroupContent>
          </SidebarGroup>
      </div>
    </Card>
  );
};
