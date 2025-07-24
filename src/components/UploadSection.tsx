
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image, 
  Video, 
  FileText, 
  X, 
  Search,
  MoreVertical,
  Trash2,
  Edit3,
  Download,
  GripVertical,
  Play,
  Eye
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UploadedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'svg';
  url: string;
  size: number;
  uploadProgress: number;
  thumbnail?: string;
}

export const UploadSection = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [draggedFile, setDraggedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback((files: File[]) => {
    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'image/svg+xml') {
        const fileId = `${Date.now()}-${Math.random()}`;
        const newFile: UploadedFile = {
          id: fileId,
          name: file.name,
          type: file.type.startsWith('video/') ? 'video' : file.type === 'image/svg+xml' ? 'svg' : 'image',
          url: URL.createObjectURL(file),
          size: file.size,
          uploadProgress: 0,
        };

        setUploadedFiles(prev => [...prev, newFile]);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            toast({
              title: "Upload Complete",
              description: `${file.name} uploaded successfully`,
            });
          }
          setUploadedFiles(prev => 
            prev.map(f => f.id === fileId ? { ...f, uploadProgress: progress } : f)
          );
        }, 200);
      } else {
        toast({
          title: "Unsupported File",
          description: "Please upload images, SVGs, or videos only",
          variant: "destructive",
        });
      }
    });
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  }, []);

  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  }, []);

  const handleBatchDelete = useCallback(() => {
    setUploadedFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
    setSelectedFiles([]);
    toast({
      title: "Files Deleted",
      description: `${selectedFiles.length} files removed`,
    });
  }, [selectedFiles]);

  const handleFileDragStart = useCallback((e: React.DragEvent, file: UploadedFile) => {
    setDraggedFile(file);
    e.dataTransfer.setData('application/json', JSON.stringify(file));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleFileDragEnd = useCallback(() => {
    setDraggedFile(null);
  }, []);

  const filteredFiles = uploadedFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'svg': return FileText;
      default: return Image;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Upload Area */}
      <Card className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
        dragActive 
          ? 'border-primary bg-primary/5 shadow-lg scale-[1.02]' 
          : 'border-border hover:border-primary/50 hover:bg-muted/30'
      }`}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="space-y-4"
        >
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-foreground">Upload Your Media</h4>
            <p className="text-sm text-muted-foreground">
              Drag files here or click to browse your computer
            </p>
          </div>
          
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge variant="secondary" className="text-xs px-3 py-1">
              <Image className="w-3 h-3 mr-1" />
              Images
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1">
              <FileText className="w-3 h-3 mr-1" />
              SVGs
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1">
              <Video className="w-3 h-3 mr-1" />
              Videos
            </Badge>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4 px-6 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.svg"
          onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
          className="hidden"
        />
      </Card>

      {/* Enhanced Search and Actions */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your uploads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border focus:border-primary"
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium text-foreground">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBatchDelete}
                className="h-8 px-3"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Files Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-foreground">
            Your Media Library
          </h4>
          <Badge variant="outline" className="text-xs">
            {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.type);
            const isSelected = selectedFiles.includes(file.id);
            const isUploading = file.uploadProgress < 100;
            
            return (
              <Card
                key={file.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                } ${draggedFile?.id === file.id ? 'opacity-50 scale-95' : ''}`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="relative">
                  {/* Drag Handle */}
                  <div 
                    className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => handleFileDragStart(e, file)}
                    onDragEnd={handleFileDragEnd}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-background/80 backdrop-blur-sm rounded-md p-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* File Preview */}
                  <div className="aspect-square bg-muted/30 rounded-t-lg flex items-center justify-center overflow-hidden relative">
                    {file.type === 'image' ? (
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        draggable={false}
                      />
                    ) : file.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video 
                          src={file.url} 
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Icon className="w-8 h-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">SVG</span>
                      </div>
                    )}
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => removeFile(file.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Drag Instruction */}
                    <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Drag to canvas or click to select
                    </div>
                  </div>
                </div>
                
                {/* Upload Progress Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="w-full max-w-[80%] space-y-2">
                      <Progress value={file.uploadProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        Uploading... {Math.round(file.uploadProgress)}%
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        
        {filteredFiles.length === 0 && uploadedFiles.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No files match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
