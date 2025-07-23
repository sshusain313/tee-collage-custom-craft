
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Undo, 
  Redo, 
  RotateCcw, 
  Star, 
  Shuffle, 
  Eye, 
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Frame,
  Palette,
  Type,
  Grid,
  Settings
} from 'lucide-react';
import { GridSelector } from './GridSelector';
import { GridType } from './GridTemplates';

interface CollageSidebarProps {
  selectedGrid: GridType | null;
  onGridSelect: (gridType: GridType) => void;
  onShowGrid: () => void;
  onClearGrid: () => void;
  isGridVisible: boolean;
  hexColumns: number;
  hexRows: number;
  squareRows: number;
  squareColumns: number;
  circleCount: number;
  focusCount: number;
  onHexColumnsChange: (columns: number) => void;
  onHexRowsChange: (rows: number) => void;
  onSquareRowsChange: (rows: number) => void;
  onSquareColumnsChange: (columns: number) => void;
  onCircleCountChange: (count: number) => void;
  onFocusCountChange: (count: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onReset?: () => void;
  onToggleNames?: () => void;
  onToggleGuidelines?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onShuffle?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showNames?: boolean;
  showGuidelines?: boolean;
}

export const CollageSidebar = ({
  selectedGrid,
  onGridSelect,
  onShowGrid,
  onClearGrid,
  isGridVisible,
  hexColumns,
  hexRows,
  squareRows,
  squareColumns,
  circleCount,
  focusCount,
  onHexColumnsChange,
  onHexRowsChange,
  onSquareRowsChange,
  onSquareColumnsChange,
  onCircleCountChange,
  onFocusCountChange,
  onUndo,
  onRedo,
  onReset,
  onToggleNames,
  onToggleGuidelines,
  onZoomIn,
  onZoomOut,
  onShuffle,
  canUndo = false,
  canRedo = false,
  showNames = true,
  showGuidelines = false,
}: CollageSidebarProps) => {
  return (
    <div className="w-80 h-full bg-gradient-card border-r border-border overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Design Tools</h2>
        </div>

        {/* Grid Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Pick Your Perfect Grid
          </h3>
          <GridSelector
            selectedGrid={selectedGrid}
            onGridSelect={onGridSelect}
            onShowGrid={onShowGrid}
            onClearGrid={onClearGrid}
            isGridVisible={isGridVisible}
            hexColumns={hexColumns}
            hexRows={hexRows}
            squareRows={squareRows}
            squareColumns={squareColumns}
            circleCount={circleCount}
            focusCount={focusCount}
            onHexColumnsChange={onHexColumnsChange}
            onHexRowsChange={onHexRowsChange}
            onSquareRowsChange={onSquareRowsChange}
            onSquareColumnsChange={onSquareColumnsChange}
            onCircleCountChange={onCircleCountChange}
            onFocusCountChange={onFocusCountChange}
          />
        </div>

        <Separator />

        {/* Action Tools */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Quick Actions</h3>
          
          {/* Undo/Redo */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex-1"
            >
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex-1"
            >
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Layout
          </Button>

          {/* Shuffle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onShuffle}
            className="w-full"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle Faces
          </Button>
        </div>

        <Separator />

        {/* View Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">View & Display</h3>
          
          {/* Zoom Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomIn}
              className="flex-1"
            >
              <ZoomIn className="w-4 h-4 mr-2" />
              Zoom In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onZoomOut}
              className="flex-1"
            >
              <ZoomOut className="w-4 h-4 mr-2" />
              Zoom Out
            </Button>
          </div>

          {/* Toggle Controls */}
          <div className="space-y-2">
            <Button
              variant={showNames ? "default" : "outline"}
              size="sm"
              onClick={onToggleNames}
              className="w-full justify-start"
            >
              <Type className="w-4 h-4 mr-2" />
              {showNames ? "Hide Names" : "Show Names"}
            </Button>
            
            <Button
              variant={showGuidelines ? "default" : "outline"}
              size="sm"
              onClick={onToggleGuidelines}
              className="w-full justify-start"
            >
              {showGuidelines ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showGuidelines ? "Hide Guidelines" : "Show Guidelines"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Face Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Face Controls</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Star className="w-4 h-4" />
              <span className="text-xs">Pick Center</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-xs">Rotate</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Frame className="w-4 h-4" />
              <span className="text-xs">Frame</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Palette className="w-4 h-4" />
              <span className="text-xs">Style</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Background & Theme */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">Background & Theme</h3>
          
          <div className="grid grid-cols-4 gap-2">
            <div className="w-full h-8 bg-white border border-border rounded cursor-pointer hover:scale-105 transition-transform" />
            <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded cursor-pointer hover:scale-105 transition-transform" />
            <div className="w-full h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded cursor-pointer hover:scale-105 transition-transform" />
            <div className="w-full h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded cursor-pointer hover:scale-105 transition-transform" />
          </div>
        </div>

        <Separator />

        {/* T-Shirt Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">T-Shirt Preview</h3>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square bg-white border border-border rounded-lg flex items-center justify-center text-xs">
              White
            </div>
            <div className="aspect-square bg-black border border-border rounded-lg flex items-center justify-center text-xs text-white">
              Black
            </div>
            <div className="aspect-square bg-navy border border-border rounded-lg flex items-center justify-center text-xs text-white">
              Navy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
