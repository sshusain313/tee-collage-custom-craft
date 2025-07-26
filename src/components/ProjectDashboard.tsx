import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  Vote,
  Trophy,
  Link as LinkIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CollageStyle } from './CollageStyleCard';
import { storageService } from '@/lib/storage';
import { Project, MemberSubmission } from '@/lib/types';
import { useParams, useNavigate } from 'react-router-dom';

export const ProjectDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [project, setProject] = useState<Project | null>(null);
  
  useEffect(() => {
    if (!projectId) {
      navigate('/');
      return;
    }

    const loadedProject = storageService.getProject(projectId);
    if (!loadedProject) {
      navigate('/');
      return;
    }
    setProject(loadedProject);
  }, [projectId, navigate]);

  if (!project) {
    return null; // Or loading state
  }

  const submissionRate = (project.submissions.length / project.memberCount) * 100;
  const remainingCount = project.memberCount - project.submissions.length;
  const totalVotes = project.votes.hexagonal + project.votes.square + project.votes.circular;
  const getPercentage = (count: number) => totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

  const collageStyles = [
    { style: 'hexagonal' as CollageStyle, label: 'Hexagonal' },
    { style: 'square' as CollageStyle, label: 'Square Grid' },
    { style: 'circular' as CollageStyle, label: 'Circular' }
  ];
  
  const getWinningStyle = (): CollageStyle => {
    const styles: Array<{ style: CollageStyle; votes: number }> = [
      { style: 'hexagonal', votes: project.votes.hexagonal },
      { style: 'square', votes: project.votes.square },
      { style: 'circular', votes: project.votes.circular }
    ];
    return styles.sort((a, b) => b.votes - a.votes)[0].style;
  };

  const handleShareLink = () => {
    const shareLink = `${window.location.origin}/upload-member?projectId=${project.id}&groupName=${encodeURIComponent(project.groupName)}&occasion=${encodeURIComponent(project.occasion)}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied! ✨",
      description: "Share it with your group members",
    });
  };

  const handleDownloadSubmissions = () => {
    const data = JSON.stringify(project.submissions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.groupName}-submissions.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your submissions export is being prepared",
    });
  };

  const handleStartCollageEditor = () => {
    navigate(`/editor/${project.id}`);
    toast({
      title: "Starting collage editor",
      description: "Taking you to the design studio...",
    });
  };

  const getEncouragementMessage = () => {
    if (project.submissions.length === 0) {
      return "Share the link to get started! 🚀";
    }
    if (remainingCount === 0) {
      return "Everyone's in! Time to create something beautiful 🎨";
    }
    if (remainingCount <= 3) {
      return `Great! Just ${remainingCount} more to go! 🎉`;
    }
    return `${project.submissions.length} memories collected so far! Keep them coming 💫`;
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
          {project.groupName}
        </h1>
        <p className="text-lg text-muted-foreground">
          {project.occasion}
        </p>
      </div>

      {/* Share Section - Shown prominently when no submissions */}
      {project.submissions.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
              <LinkIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Share with Your Group</h2>
              <p className="text-muted-foreground">
                Get started by sharing the upload link with your {project.memberCount} group members
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleShareLink} 
                size="lg"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Upload Link
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2"
                onClick={() => {
                  const shareLink = `${window.location.origin}/upload-member?projectId=${project.id}&groupName=${encodeURIComponent(project.groupName)}&occasion=${encodeURIComponent(project.occasion)}`;
                  window.open(`mailto:?subject=Join our ${project.occasion} collage&body=Click this link to upload your photo: ${shareLink}`);
                }}
              >
                <Mail className="w-4 h-4" />
                Share via Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview and Voting Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {project.submissions.length} of {project.memberCount}
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
              {project.submissions.length > 0 && (
                <Button onClick={handleDownloadSubmissions} variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Submissions
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Voting Results */}
        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-primary" />
              Style Voting Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">
                  {collageStyles.find(s => s.style === getWinningStyle())?.label} is leading!
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Total votes: {totalVotes}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {collageStyles.map(({ style, label }) => (
                <div key={style} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{project.votes[style]} votes</span>
                        <Badge variant="secondary" className="text-xs">
                          {getPercentage(project.votes[style])}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={getPercentage(project.votes[style])} className="h-2" />
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleStartCollageEditor} 
              variant="creative" 
              className="w-full flex items-center gap-2"
              disabled={project.submissions.length === 0}
            >
              <Palette className="w-4 h-4" />
              Start Collage Editor
            </Button>
          </CardContent>
        </Card>
      </div>

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
          {project.submissions.length === 0 ? (
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
              {project.submissions.map((submission) => (
                <Card key={submission.id} className="bg-background/50 hover:bg-background/70 transition-colors">
                  <CardContent className="p-4">
                    <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} gap-4`}>
                      <Avatar className={viewMode === 'grid' ? 'w-16 h-16 mx-auto' : 'w-12 h-12'}>
                        <AvatarImage src={submission.photo} alt={submission.name} />
                        <AvatarFallback>{submission.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex-1 ${viewMode === 'grid' ? 'text-center' : ''} space-y-2`}>
                        <div>
                          <h4 className="font-semibold">{submission.name}</h4>
                          <div className="flex items-center gap-2 justify-center">
                            {submission.role && (
                              <Badge variant="secondary" className="text-xs">
                                {submission.role}
                              </Badge>
                            )}
                            {submission.collageStyle && (
                              <Badge variant="outline" className="text-xs">
                                Voted: {collageStyles.find(s => s.style === submission.collageStyle)?.label}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {submission.message && (
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground italic">
                              "{submission.message}"
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                          <Clock className="w-3 h-3" />
                          {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
