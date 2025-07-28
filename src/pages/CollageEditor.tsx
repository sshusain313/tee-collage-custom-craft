import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas as FabricCanvas, FabricImage, Rect, FabricText } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { storageService } from '@/lib/storage';
import { Project, MemberSubmission } from '@/lib/types';
import { CollageStyle } from '@/components/CollageStyleCard';
import { useToast } from '@/hooks/use-toast';
import { useGridTemplates, GridType, GridCell, fitImageToCell } from '@/components/GridTemplates';
import {
  ArrowLeft,
  Download,
  Save,
  RotateCcw,
  RefreshCw,
  Shirt,
  Image as ImageIcon
} from 'lucide-react';

interface CollageEditorProps {}

const CollageEditor: React.FC<CollageEditorProps> = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const collageCanvasRef = useRef<HTMLCanvasElement>(null);
  const tshirtCanvasRef = useRef<HTMLCanvasElement>(null);
  const [collageCanvas, setCollageCanvas] = useState<FabricCanvas | null>(null);
  const [tshirtCanvas, setTshirtCanvas] = useState<FabricCanvas | null>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [winningStyle, setWinningStyle] = useState<GridType>('hexagonal');
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gridCells, setGridCells] = useState<GridCell[]>([]);

  const { createHexagonalGrid, createSquareGrid, createCenterFocusGrid } = useGridTemplates();

  useEffect(() => {
    if (!projectId) {
      navigate('/my-projects');
      return;
    }
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project && collageCanvasRef.current && tshirtCanvasRef.current) {
      initializeCanvases();
    }
  }, [project]);

  const loadProject = () => {
    setIsLoading(true);
    try {
      const loadedProject = storageService.getProject(projectId!);
      if (!loadedProject) {
        toast({
          title: "Project not found",
          description: "The requested project could not be found.",
          variant: "destructive",
        });
        navigate('/my-projects');
        return;
      }

      setProject(loadedProject);
      
      // Determine winning style based on votes
      const styleMapping: Record<CollageStyle, GridType> = {
        'hexagonal': 'hexagonal',
        'square': 'square', 
        'circular': 'center-focus'
      };
      
      const votes = loadedProject.votes;
      const styles = Object.keys(votes) as CollageStyle[];
      const winningCollageStyle = styles.reduce((prev, current) => 
        votes[current] > votes[prev] ? current : prev
      );
      
      setWinningStyle(styleMapping[winningCollageStyle]);
      
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Error loading project",
        description: "An error occurred while loading the project.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeCanvases = async () => {
    if (!collageCanvasRef.current || !tshirtCanvasRef.current || !project) return;

    // Initialize collage canvas
    const collageCanvasInstance = new FabricCanvas(collageCanvasRef.current, {
      width: 600,
      height: 600,
      backgroundColor: backgroundColor,
    });
    setCollageCanvas(collageCanvasInstance);

    // Initialize T-shirt canvas
    const tshirtCanvasInstance = new FabricCanvas(tshirtCanvasRef.current, {
      width: 600,
      height: 700,
      backgroundColor: '#f5f5f5',
    });
    setTshirtCanvas(tshirtCanvasInstance);

    // Load T-shirt mockup
    await loadTshirtMockup(tshirtCanvasInstance);
    
    // Create collage layout using grid templates with memberCount
    await createCollageWithGridTemplates(collageCanvasInstance, tshirtCanvasInstance);

    toast({
      title: "Editor ready! 🎨",
      description: `Using ${winningStyle} layout with ${project.memberCount} total slots`,
    });
  };

  const loadTshirtMockup = async (canvas: FabricCanvas) => {
    try {
      const img = await FabricImage.fromURL('/lovable-uploads/eb0f2d5d-b477-4550-909d-c9dd90d6f347.png');
      img.set({
        left: 0,
        top: 0,
        scaleX: canvas.width! / img.width!,
        scaleY: canvas.height! / img.height!,
        selectable: false,
        evented: false,
      });
      canvas.add(img);
      canvas.renderAll();
    } catch (error) {
      console.error('Error loading T-shirt mockup:', error);
      // Fallback: create a simple T-shirt shape
      const tshirtRect = new Rect({
        left: 50,
        top: 50,
        width: canvas.width! - 100,
        height: canvas.height! - 100,
        fill: '#ffffff',
        stroke: '#cccccc',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        rx: 20,
        ry: 20,
      });
      canvas.add(tshirtRect);
      canvas.renderAll();
    }
  };

  const createCollageWithGridTemplates = async (collageCanvas: FabricCanvas, tshirtCanvas: FabricCanvas) => {
    if (!project) return;

    // Use memberCount for total cells, not submission count
    const memberCount = project.memberCount;
    const submissions = project.submissions;
    
    // Create grid cells using the winning template with memberCount
    let cells: GridCell[] = [];
    
    if (winningStyle === 'hexagonal') {
      cells = createHexagonalGrid(collageCanvas, memberCount);
    } else if (winningStyle === 'square') {
      cells = createSquareGrid(collageCanvas, memberCount);
    } else if (winningStyle === 'center-focus') {
      cells = createCenterFocusGrid(collageCanvas, memberCount);
    }

    setGridCells(cells);

    // Add grid shapes to canvas
    cells.forEach(cell => {
      collageCanvas.add(cell.shape);
    });

    // Load images into cells and create placeholders
    await loadImagesIntoCells(cells, submissions, collageCanvas, tshirtCanvas);
  };

  const loadImagesIntoCells = async (cells: GridCell[], submissions: MemberSubmission[], collageCanvas: FabricCanvas, tshirtCanvas: FabricCanvas) => {
    const loadPromises = cells.map(async (cell, index) => {
      if (index < submissions.length) {
        // Load actual submission image
        const submission = submissions[index];
        try {
          const img = await FabricImage.fromURL(submission.photo);
          
          // Fit image to cell for collage canvas
          fitImageToCell(img, cell);
          cell.image = img;
          collageCanvas.add(img);

          // Create scaled version for T-shirt canvas
          const tshirtImg = await FabricImage.fromURL(submission.photo);
          const tshirtCell = {
            ...cell,
            shape: await cell.shape.clone(),
            centerX: 300 + (cell.centerX - 300) * 0.4,
            centerY: 400 + (cell.centerY - 300) * 0.4,
            size: cell.size * 0.4
          };
          
          tshirtCell.shape.set({
            left: tshirtCell.centerX,
            top: tshirtCell.centerY,
            scaleX: (cell.shape.scaleX || 1) * 0.4,
            scaleY: (cell.shape.scaleY || 1) * 0.4,
            originX: 'center',
            originY: 'center',
          });

          fitImageToCell(tshirtImg, tshirtCell);
          tshirtCanvas.add(tshirtCell.shape);
          tshirtCanvas.add(tshirtImg);
          
        } catch (error) {
          console.error('Error loading image for cell:', error);
          // Add placeholder for failed image load
          addPlaceholderToCell(cell, index, collageCanvas, tshirtCanvas);
        }
      } else {
        // Add placeholder for empty cell
        addPlaceholderToCell(cell, index, collageCanvas, tshirtCanvas);
      }
    });

    await Promise.all(loadPromises);
    
    collageCanvas.renderAll();
    tshirtCanvas.renderAll();
  };

  const addPlaceholderToCell = (cell: GridCell, index: number, collageCanvas: FabricCanvas, tshirtCanvas: FabricCanvas) => {
    // Create placeholder for collage canvas
    const placeholderSize = cell.size * 0.8;
    const placeholder = new Rect({
      left: cell.centerX - placeholderSize / 2,
      top: cell.centerY - placeholderSize / 2,
      width: placeholderSize,
      height: placeholderSize,
      fill: cell.isCenter ? 'rgba(124, 58, 237, 0.1)' : 'rgba(200, 200, 200, 0.1)',
      stroke: cell.isCenter ? 'hsl(280, 100%, 50%)' : 'hsl(280, 100%, 60%)',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      rx: 8,
      ry: 8,
    });
    
    const placeholderText = new FabricText(
      index < project!.submissions.length ? `${index + 1}` : 'Empty',
      {
        left: cell.centerX,
        top: cell.centerY,
        fontSize: cell.isCenter ? 18 : 14,
        fill: cell.isCenter ? 'hsl(280, 100%, 50%)' : 'hsl(280, 100%, 60%)',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      }
    );
    
    collageCanvas.add(placeholder);
    collageCanvas.add(placeholderText);

    // Create smaller version for T-shirt canvas
    const tshirtPlaceholder = new Rect({
      left: 300 + (cell.centerX - 300) * 0.4 - (placeholderSize * 0.4) / 2,
      top: 400 + (cell.centerY - 300) * 0.4 - (placeholderSize * 0.4) / 2,
      width: placeholderSize * 0.4,
      height: placeholderSize * 0.4,
      fill: cell.isCenter ? 'rgba(124, 58, 237, 0.1)' : 'rgba(200, 200, 200, 0.1)',
      stroke: cell.isCenter ? 'hsl(280, 100%, 50%)' : 'hsl(280, 100%, 60%)',
      strokeWidth: 1,
      strokeDashArray: [3, 3],
      selectable: false,
      evented: false,
      rx: 4,
      ry: 4,
    });
    
    const tshirtText = new FabricText(
      index < project!.submissions.length ? `${index + 1}` : 'E',
      {
        left: 300 + (cell.centerX - 300) * 0.4,
        top: 400 + (cell.centerY - 300) * 0.4,
        fontSize: cell.isCenter ? 10 : 8,
        fill: cell.isCenter ? 'hsl(280, 100%, 50%)' : 'hsl(280, 100%, 60%)',
        fontWeight: 'bold',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      }
    );
    
    tshirtCanvas.add(tshirtPlaceholder);
    tshirtCanvas.add(tshirtText);
  };

  const handleSaveCollage = () => {
    if (!collageCanvas) return;
    
    const dataURL = collageCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const link = document.createElement('a');
    link.download = `${project?.groupName}-collage.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Collage saved! 💾",
      description: "Your collage has been downloaded successfully.",
    });
  };

  const handleSaveTshirtMockup = () => {
    if (!tshirtCanvas) return;
    
    const dataURL = tshirtCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    
    const link = document.createElement('a');
    link.download = `${project?.groupName}-tshirt-mockup.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "T-shirt mockup saved! 👕",
      description: "Your T-shirt mockup has been downloaded successfully.",
    });
  };

  const handleResetLayout = () => {
    if (collageCanvas && tshirtCanvas && project) {
      collageCanvas.clear();
      tshirtCanvas.clear();
      collageCanvas.backgroundColor = backgroundColor;
      tshirtCanvas.backgroundColor = '#f5f5f5';
      initializeCanvases();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-lg">Loading your collage editor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Project not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/my-project/${projectId}`)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{project.groupName} - Collage Editor</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{winningStyle} layout</Badge>
                <span>•</span>
                <span>{project.submissions.length} of {project.memberCount} photos uploaded</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleResetLayout} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button 
              onClick={() => navigate(`/preview/${projectId}`)} 
              variant="default" 
              size="sm" 
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Continue to Preview
            </Button>
          </div>
        </div>

        {/* Editor Controls Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Editor Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Background Color:</label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => {
                  setBackgroundColor(e.target.value);
                  if (collageCanvas) {
                    collageCanvas.backgroundColor = e.target.value;
                    collageCanvas.renderAll();
                  }
                }}
                className="w-12 h-10 rounded border cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">{backgroundColor}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Grid Template: <Badge variant="secondary">{winningStyle}</Badge>
              </span>
              <span className="text-sm text-muted-foreground">
                • {project.submissions.length} photos uploaded of {project.memberCount} total slots
              </span>
              <span className="text-sm text-muted-foreground">
                • Center cell is 2x larger
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Area */}
        <Tabs defaultValue="collage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="collage" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Collage Design
            </TabsTrigger>
            <TabsTrigger value="tshirt" className="gap-2">
              <Shirt className="w-4 h-4" />
              T-Shirt Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="collage">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Collage Canvas</CardTitle>
                <Button onClick={handleSaveCollage} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Collage
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas
                    ref={collageCanvasRef}
                    className="border rounded-lg shadow-lg max-w-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Your {winningStyle} collage with {project.memberCount} total slots (center cell is 2x larger)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tshirt">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>T-Shirt Mockup</CardTitle>
                <Button onClick={handleSaveTshirtMockup} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Mockup
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <canvas
                    ref={tshirtCanvasRef}
                    className="border rounded-lg shadow-lg max-w-full"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Preview of how your collage will look on a T-shirt
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CollageEditor;
