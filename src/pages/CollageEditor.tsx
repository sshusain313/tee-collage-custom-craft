
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas as FabricCanvas, FabricImage, Circle, Rect, Polygon } from 'fabric';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { storageService } from '@/lib/storage';
import { Project, MemberSubmission } from '@/lib/types';
import { CollageStyle } from '@/components/CollageStyleCard';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Download,
  Save,
  RotateCcw,
  Palette,
  Move,
  ZoomIn,
  ZoomOut,
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
  const [winningStyle, setWinningStyle] = useState<CollageStyle>('hexagonal');
  const [isLoading, setIsLoading] = useState(true);
  const [collageScale, setCollageScale] = useState([1]);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

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
      
      // Determine winning style
      const styles = ['hexagonal', 'square', 'circular'] as CollageStyle[];
      const winningStyleResult = styles.reduce((prev, current) => 
        loadedProject.votes[current] > loadedProject.votes[prev] ? current : prev
      );
      setWinningStyle(winningStyleResult);
      
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
    
    // Create collage layout
    await createCollageLayout(collageCanvasInstance, tshirtCanvasInstance);

    toast({
      title: "Editor ready! 🎨",
      description: `Using ${winningStyle} layout with ${project.submissions.length} photos`,
    });
  };

  const loadTshirtMockup = async (canvas: FabricCanvas) => {
    try {
      const img = await FabricImage.fromURL('/lovable-uploads/daa84bd7-cc62-4500-9a32-f2a7e0cfb145.png');
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
    }
  };

  const createCollageLayout = async (collageCanvas: FabricCanvas, tshirtCanvas: FabricCanvas) => {
    if (!project?.submissions.length) return;

    const submissions = project.submissions;
    const canvasWidth = collageCanvas.width!;
    const canvasHeight = collageCanvas.height!;

    try {
      if (winningStyle === 'hexagonal') {
        await createHexagonalLayout(collageCanvas, tshirtCanvas, submissions, canvasWidth, canvasHeight);
      } else if (winningStyle === 'square') {
        await createSquareLayout(collageCanvas, tshirtCanvas, submissions, canvasWidth, canvasHeight);
      } else if (winningStyle === 'circular') {
        await createCircularLayout(collageCanvas, tshirtCanvas, submissions, canvasWidth, canvasHeight);
      }
    } catch (error) {
      console.error('Error creating collage layout:', error);
      toast({
        title: "Layout error",
        description: "There was an issue creating the collage layout.",
        variant: "destructive",
      });
    }
  };

  const createHexagonalLayout = async (collageCanvas: FabricCanvas, tshirtCanvas: FabricCanvas, submissions: MemberSubmission[], canvasWidth: number, canvasHeight: number) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const largeHexSize = Math.min(canvasWidth, canvasHeight) / 4.5;
    const smallHexSize = largeHexSize / 2;

    // Create center hexagon with first submission
    if (submissions[0]) {
      const centerHex = await createHexagonWithImage(submissions[0], centerX, centerY, largeHexSize);
      collageCanvas.add(centerHex);
      
      // Clone for T-shirt
      const tshirtHex = await createHexagonWithImage(submissions[0], 300, 350, largeHexSize * 0.5);
      tshirtCanvas.add(tshirtHex);
    }

    // Create surrounding hexagons
    for (let i = 1; i < Math.min(submissions.length, 7); i++) {
      const angle = Math.PI / 3 * (i - 1);
      const dist = largeHexSize + smallHexSize + 5;
      const x = centerX + dist * Math.cos(angle);
      const y = centerY + dist * Math.sin(angle);
      
      const hex = await createHexagonWithImage(submissions[i], x, y, smallHexSize);
      collageCanvas.add(hex);
      
      // Clone for T-shirt
      const tshirtHex = await createHexagonWithImage(submissions[i], 
        300 + (dist * 0.5) * Math.cos(angle), 
        350 + (dist * 0.5) * Math.sin(angle), 
        smallHexSize * 0.5
      );
      tshirtCanvas.add(tshirtHex);
    }

    collageCanvas.renderAll();
    tshirtCanvas.renderAll();
  };

  const createSquareLayout = async (collageCanvas: FabricCanvas, tshirtCanvas: FabricCanvas, submissions: MemberSubmission[], canvasWidth: number, canvasHeight: number) => {
    const cols = Math.ceil(Math.sqrt(submissions.length));
    const rows = Math.ceil(submissions.length / cols);
    const cellWidth = canvasWidth / cols;
    const cellHeight = canvasHeight / rows;

    for (let i = 0; i < submissions.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      
      const square = await createSquareWithImage(submissions[i], x, y, Math.min(cellWidth, cellHeight) * 0.8);
      collageCanvas.add(square);
      
      // Clone for T-shirt
      const tshirtSquare = await createSquareWithImage(submissions[i], 
        200 + (col * cellWidth * 0.4), 
        300 + (row * cellHeight * 0.4), 
        Math.min(cellWidth, cellHeight) * 0.3
      );
      tshirtCanvas.add(tshirtSquare);
    }

    collageCanvas.renderAll();
    tshirtCanvas.renderAll();
  };

  const createCircularLayout = async (collageCanvas: FabricCanvas, tshirtCanvas: FabricCanvas, submissions: MemberSubmission[], canvasWidth: number, canvasHeight: number) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const centerRadius = 80;
    const surroundingRadius = 40;

    // Center circle
    if (submissions[0]) {
      const centerCircle = await createCircleWithImage(submissions[0], centerX, centerY, centerRadius);
      collageCanvas.add(centerCircle);
      
      const tshirtCircle = await createCircleWithImage(submissions[0], 300, 350, centerRadius * 0.5);
      tshirtCanvas.add(tshirtCircle);
    }

    // Surrounding circles
    const radius = 150;
    for (let i = 1; i < submissions.length; i++) {
      const angle = (2 * Math.PI * (i - 1)) / (submissions.length - 1);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      const circle = await createCircleWithImage(submissions[i], x, y, surroundingRadius);
      collageCanvas.add(circle);
      
      const tshirtCircle = await createCircleWithImage(submissions[i], 
        300 + (radius * 0.5) * Math.cos(angle), 
        350 + (radius * 0.5) * Math.sin(angle), 
        surroundingRadius * 0.5
      );
      tshirtCanvas.add(tshirtCircle);
    }

    collageCanvas.renderAll();
    tshirtCanvas.renderAll();
  };

  const createHexagonWithImage = async (submission: MemberSubmission, x: number, y: number, size: number) => {
    const img = await FabricImage.fromURL(submission.photo);
    
    // Create hexagon clip path
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push({
        x: size * Math.cos(angle),
        y: size * Math.sin(angle)
      });
    }
    
    const hex = new Polygon(points, {
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      fill: 'transparent',
      stroke: '#8B5CF6',
      strokeWidth: 2,
    });

    // Scale and position image
    const scale = Math.min(size * 2 / img.width!, size * 2 / img.height!);
    img.set({
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale,
      clipPath: hex,
    });

    return img;
  };

  const createSquareWithImage = async (submission: MemberSubmission, x: number, y: number, size: number) => {
    const img = await FabricImage.fromURL(submission.photo);
    
    const scale = Math.min(size / img.width!, size / img.height!);
    img.set({
      left: x - size/2,
      top: y - size/2,
      scaleX: scale,
      scaleY: scale,
      stroke: '#8B5CF6',
      strokeWidth: 2,
    });

    return img;
  };

  const createCircleWithImage = async (submission: MemberSubmission, x: number, y: number, radius: number) => {
    const img = await FabricImage.fromURL(submission.photo);
    
    const clipPath = new Circle({
      radius: radius,
      originX: 'center',
      originY: 'center',
    });

    const scale = Math.min((radius * 2) / img.width!, (radius * 2) / img.height!);
    img.set({
      left: x,
      top: y,
      originX: 'center',
      originY: 'center',
      scaleX: scale,
      scaleY: scale,
      clipPath: clipPath,
      stroke: '#8B5CF6',
      strokeWidth: 2,
    });

    return img;
  };

  const handleSaveCollage = () => {
    if (!collageCanvas) return;
    
    const dataURL = collageCanvas.toDataURL({
      format: 'png',
      quality: 1,
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
                <span>{project.submissions.length} photos</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleResetLayout} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSaveCollage} variant="default" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button 
              onClick={() => navigate(`/preview/${projectId}`)} 
              variant="hero" 
              size="sm" 
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Continue to Preview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Editor Controls */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Editor Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2">
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
                </div>

                <div className="space-y-2">
                  <Label>Collage Scale</Label>
                  <Slider
                    value={collageScale}
                    onValueChange={(value) => {
                      setCollageScale(value);
                      // Apply scale to canvas objects
                      if (collageCanvas) {
                        collageCanvas.getObjects().forEach(obj => {
                          if (obj.type === 'image') {
                            obj.set({
                              scaleX: (obj.scaleX || 1) * value[0],
                              scaleY: (obj.scaleY || 1) * value[0]
                            });
                          }
                        });
                        collageCanvas.renderAll();
                      }
                    }}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">
                    Scale: {collageScale[0]}x
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Quick Actions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => collageCanvas?.getObjects().forEach(obj => obj.set({ angle: (obj.angle || 0) + 90 }) && collageCanvas.renderAll())}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      collageCanvas?.setZoom(collageCanvas.getZoom() * 1.1);
                      collageCanvas?.renderAll();
                    }}>
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      collageCanvas?.setZoom(collageCanvas.getZoom() * 0.9);
                      collageCanvas?.renderAll();
                    }}>
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      collageCanvas?.setZoom(1);
                      collageCanvas?.renderAll();
                    }}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Layout:</span>
                  <Badge variant="secondary">{winningStyle}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photos:</span>
                  <span>{project.submissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Votes:</span>
                  <span>{project.votes[winningStyle]}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="xl:col-span-3">
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
                  <CardHeader>
                    <CardTitle>Collage Canvas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <canvas
                        ref={collageCanvasRef}
                        className="border rounded-lg shadow-lg max-w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tshirt">
                <Card>
                  <CardHeader>
                    <CardTitle>T-Shirt Mockup</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <canvas
                        ref={tshirtCanvasRef}
                        className="border rounded-lg shadow-lg max-w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CollageEditor;
