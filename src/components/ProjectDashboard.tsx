
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Layout from '@/components/Layout';
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
  Link as LinkIcon,
  TrendingUp,
  Target,
  Zap,
  Star,
  ArrowLeft,
  BarChart3,
  Activity,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'analytics'>('overview');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (!projectId) {
      navigate('/my-projects');
      return;
    }

    const loadedProject = storageService.getProject(projectId);
    if (!loadedProject) {
      navigate('/my-projects');
      return;
    }
    setProject(loadedProject);
  }, [projectId, navigate]);

  const handleDeleteProject = async () => {
    if (!project || !projectId) return;
    
    setIsDeleting(true);
    try {
      const success = storageService.deleteProject(projectId);
      if (success) {
        toast({
          title: "Project deleted successfully",
          description: `"${project.groupName}" has been permanently removed.`,
        });
        navigate('/my-projects');
      } else {
        toast({
          title: "Failed to delete project",
          description: "An error occurred while deleting the project. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting project",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) {
    return null;
  }

  const submissionRate = (project.submissions.length / project.memberCount) * 100;
  const remainingCount = project.memberCount - project.submissions.length;
  const totalVotes = project.votes.hexagonal + project.votes.square + project.votes.circular;
  const getPercentage = (count: number) => totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

  const collageStyles = [
    { style: 'hexagonal' as CollageStyle, label: 'Hexagonal', votes: project.votes.hexagonal },
    { style: 'square' as CollageStyle, label: 'Square Grid', votes: project.votes.square },
    { style: 'circular' as CollageStyle, label: 'Circular', votes: project.votes.circular }
  ];
  
  const getWinningStyle = (): CollageStyle => {
    return collageStyles.sort((a, b) => b.votes - a.votes)[0].style;
  };

  const getProjectStatus = () => {
    if (submissionRate === 100) return { label: 'Complete', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (submissionRate > 75) return { label: 'Almost Done', color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
    if (submissionRate > 25) return { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Activity };
    return { label: 'Just Started', color: 'bg-gray-100 text-gray-800', icon: Target };
  };

  const handleShareLink = () => {
    const shareLink = `${window.location.origin}/upload-member?projectId=${project.id}&groupName=${encodeURIComponent(project.groupName)}&occasion=${encodeURIComponent(project.occasion)}`;
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Share link copied! ✨",
      description: "Send it to your group members to collect their photos",
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
      title: "Download complete! 📥",
      description: "All submissions have been exported successfully",
    });
  };

  const handleStartCollageEditor = () => {
    navigate(`/editor/${project.id}`);
    toast({
      title: "Opening design studio... 🎨",
      description: "Get ready to create something beautiful!",
    });
  };

  const getEncouragementMessage = () => {
    if (project.submissions.length === 0) {
      return "Share your link to start collecting memories! 🚀";
    }
    if (remainingCount === 0) {
      return "Amazing! Everyone has joined. Time to create magic! ✨";
    }
    if (remainingCount <= 3) {
      return `So close! Just ${remainingCount} more to complete the collection 🎯`;
    }
    return `Great progress! ${project.submissions.length} memories collected so far 📸`;
  };

  const status = getProjectStatus();

  return (
    <Layout>
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-projects')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>

          {/* Delete Project Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Delete Project
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{project.groupName}"? This action cannot be undone and will permanently remove:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All project data and settings</li>
                    <li>{project.submissions.length} member submissions</li>
                    <li>All voting results</li>
                    <li>Project configuration</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 text-white">
              <status.icon className="w-5 h-5 text-primary" />
              <Badge className={status.color}>
                {status.label}
              </Badge>
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {project.groupName}
            </h1>
            <p className="text-xl text-white/90">
              {project.occasion}
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {project.memberCount} members
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call-to-Action for Empty Projects */}
      {project.submissions.length === 0 && (
        <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/20 shadow-elegant">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <LinkIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">Ready to start collecting?</h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Share your upload link with {project.memberCount} group members to begin gathering their favorite photos
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleShareLink} 
                size="lg"
                variant="hero"
                className="gap-2 shadow-glow"
              >
                <Copy className="w-5 h-5" />
                Copy Upload Link
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2"
                onClick={() => {
                  const shareLink = `${window.location.origin}/upload-member?projectId=${project.id}&groupName=${encodeURIComponent(project.groupName)}&occasion=${encodeURIComponent(project.occasion)}`;
                  window.open(`mailto:?subject=Join our ${project.occasion} memory collage&body=Hi! Please upload your favorite photo for our group collage: ${shareLink}`);
                }}
              >
                <Mail className="w-5 h-5" />
                Share via Email
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-card shadow-elegant">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Users className="w-4 h-4" />
            Submissions ({project.submissions.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Vote className="w-4 h-4" />
            Voting Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress and Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Card */}
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Collection Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {project.submissions.length} / {project.memberCount}
                  </div>
                  <Progress value={submissionRate} className="h-4 shadow-inner" />
                  <p className="text-lg text-muted-foreground">
                    {getEncouragementMessage()}
                  </p>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button onClick={handleShareLink} variant="hero" className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </Button>
                  {project.submissions.length > 0 && (
                    <Button onClick={handleDownloadSubmissions} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-card shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Project Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-primary">{project.memberCount}</div>
                    <div className="text-sm text-muted-foreground">Total Members</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-green-600">{project.submissions.length}</div>
                    <div className="text-sm text-muted-foreground">Photos Collected</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-blue-600">{totalVotes}</div>
                    <div className="text-sm text-muted-foreground">Total Votes</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-purple-600">{Math.round(submissionRate)}%</div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Palette className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Ready to Design?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your collage layout and customize the design
                  </p>
                  <Button 
                    onClick={handleStartCollageEditor} 
                    variant="hero" 
                    className="w-full gap-2"
                    disabled={project.submissions.length === 0}
                  >
                    <Palette className="w-4 h-4" />
                    Open Design Studio
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Voting Leader</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {collageStyles.find(s => s.style === getWinningStyle())?.label} style is winning!
                  </p>
                  <div className="text-2xl font-bold text-accent">
                    {project.votes[getWinningStyle()]} votes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Member Submissions
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
                    <h3 className="text-xl font-semibold">Waiting for submissions...</h3>
                    <p className="text-muted-foreground">
                      Once members upload their photos, they'll appear here
                    </p>
                  </div>
                  <Button onClick={handleShareLink} variant="outline" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Share Upload Link
                  </Button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  {project.submissions.map((submission) => (
                    <Card key={submission.id} className="bg-background/50 hover:bg-background/70 transition-colors shadow-elegant">
                      <CardContent className="p-4">
                        <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} gap-4`}>
                          <Avatar className={viewMode === 'grid' ? 'w-16 h-16 mx-auto' : 'w-12 h-12'}>
                            <AvatarImage src={submission.photo} alt={submission.name} />
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                              {submission.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex-1 ${viewMode === 'grid' ? 'text-center' : ''} space-y-2`}>
                            <div>
                              <h4 className="font-semibold">{submission.name}</h4>
                              <div className="flex items-center gap-2 justify-center flex-wrap">
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gradient-card shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-primary" />
                Collage Style Voting Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="text-xl font-semibold">
                    {collageStyles.find(s => s.style === getWinningStyle())?.label} is leading!
                  </span>
                </div>
                <div className="text-muted-foreground">
                  Total votes cast: <span className="font-medium">{totalVotes}</span>
                </div>
              </div>

              <div className="space-y-4">
                {collageStyles
                  .sort((a, b) => b.votes - a.votes)
                  .map(({ style, label, votes }) => (
                    <div key={style} className="relative p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {votes === Math.max(...collageStyles.map(s => s.votes)) && votes > 0 && (
                            <Star className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="font-medium text-lg">{label}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{votes}</div>
                          <div className="text-sm text-muted-foreground">
                            {getPercentage(votes)}% of votes
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={getPercentage(votes)} 
                        className="h-3"
                      />
                    </div>
                  ))}
              </div>

              {totalVotes === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
                    <Vote className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">No votes yet</h3>
                  <p className="text-muted-foreground">
                    Members will vote for their preferred collage style when they submit their photos
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Next Steps */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-elegant">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            What's next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Collect all photos</p>
                <p className="text-sm text-muted-foreground">Share your link until everyone has joined ({remainingCount} remaining)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Design your collage</p>
                <p className="text-sm text-muted-foreground">Arrange photos into a beautiful layout using our design studio</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Order T-shirts</p>
                <p className="text-sm text-muted-foreground">Get beautiful shirts for everyone to remember this moment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
};
