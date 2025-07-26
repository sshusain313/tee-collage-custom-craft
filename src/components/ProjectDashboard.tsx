
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Share2, 
  Download, 
  Palette, 
  Users, 
  Heart, 
  Clock, 
  CheckCircle,
  Copy,
  Mail,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MemberSubmission {
  id: string;
  name: string;
  role?: string;
  message?: string;
  photoUrl?: string;
  submittedAt: Date;
}

export const ProjectDashboard = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Mock data - in real app this would come from API
  const projectData = {
    id: 'proj_123',
    name: 'CS Dept Batch 2025',
    occasion: 'Graduation farewell',
    totalMembers: 25,
    shareLink: 'https://teecollage.com/upload?projectId=proj_123',
    createdAt: new Date('2025-01-15'),
  };

  const submissions: MemberSubmission[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Class President',
      message: 'Thanks for the amazing memories everyone! 🎓',
      photoUrl: '/placeholder.svg',
      submittedAt: new Date('2025-01-20T10:30:00'),
    },
    {
      id: '2',
      name: 'Mike Chen',
      role: 'Study Group Leader',
      message: 'Four years flew by so fast!',
      photoUrl: '/placeholder.svg',
      submittedAt: new Date('2025-01-20T14:15:00'),
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      message: 'Love you all! Keep in touch 💕',
      photoUrl: '/placeholder.svg',
      submittedAt: new Date('2025-01-21T09:45:00'),
    },
  ];

  const submissionRate = (submissions.length / projectData.totalMembers) * 100;
  const remainingCount = projectData.totalMembers - submissions.length;

  const handleShareLink = () => {
    navigator.clipboard.writeText(projectData.shareLink);
    toast({
      title: "Link copied! ✨",
      description: "Share it with your group members",
    });
  };

  const handleDownloadSubmissions = () => {
    toast({
      title: "Download started",
      description: "Your submissions export is being prepared",
    });
  };

  const handleStartCollageEditor = () => {
    toast({
      title: "Starting collage editor",
      description: "Taking you to the design studio...",
    });
  };

  const getEncouragementMessage = () => {
    if (submissions.length === 0) {
      return "Share the link to get started! 🚀";
    }
    if (remainingCount === 0) {
      return "Everyone's in! Time to create something beautiful 🎨";
    }
    if (remainingCount <= 3) {
      return `Great! Just ${remainingCount} more to go! 🎉`;
    }
    return `${submissions.length} memories collected so far! Keep them coming 💫`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Your Project Dashboard</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {projectData.name}
        </h1>
        <p className="text-lg text-muted-foreground">
          {projectData.occasion}
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Collecting memories...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-3xl font-bold">
              {submissions.length} of {projectData.totalMembers}
            </div>
            <Progress value={submissionRate} className="h-3" />
            <p className="text-lg text-muted-foreground">
              {getEncouragementMessage()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleShareLink} variant="hero" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Link Again
            </Button>
            <Button onClick={handleDownloadSubmissions} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Submissions
            </Button>
            <Button 
              onClick={handleStartCollageEditor} 
              variant="creative" 
              className="flex items-center gap-2"
              disabled={submissions.length === 0}
            >
              <Palette className="w-4 h-4" />
              Start Collage Editor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Section */}
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Recent Submissions
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No submissions yet</h3>
                <p className="text-muted-foreground">
                  Share the link to get started! Once people submit their photos, they'll appear here.
                </p>
              </div>
              <Button onClick={handleShareLink} variant="outline" className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                Copy Share Link
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {submissions.map((submission) => (
                <Card key={submission.id} className="bg-background/50 hover:bg-background/70 transition-colors">
                  <CardContent className="p-4">
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} gap-4`}>
                      <Avatar className={viewMode === 'grid' ? 'w-16 h-16 mx-auto' : 'w-12 h-12'}>
                        <AvatarImage src={submission.photoUrl} alt={submission.name} />
                        <AvatarFallback>{submission.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 ${viewMode === 'grid' ? 'text-center' : ''} space-y-2`}>
                        <div>
                          <h4 className="font-semibold">{submission.name}</h4>
                          {submission.role && (
                            <Badge variant="secondary" className="text-xs">
                              {submission.role}
                            </Badge>
                          )}
                        </div>
                        
                        {submission.message && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground italic">
                              "{submission.message}"
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {submission.submittedAt.toLocaleDateString()} at {submission.submittedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            What's next?
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">1</span>
              </div>
              <div>
                <p className="font-medium">Keep collecting submissions</p>
                <p className="text-muted-foreground">Share your link until everyone has joined</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">2</span>
              </div>
              <div>
                <p className="font-medium">Design your collage</p>
                <p className="text-muted-foreground">Arrange everyone's photos into a beautiful layout</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium">3</span>
              </div>
              <div>
                <p className="font-medium">Order your T-shirts</p>
                <p className="text-muted-foreground">Get beautiful shirts for everyone to remember this moment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
