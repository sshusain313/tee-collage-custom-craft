
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Heart, 
  ArrowRight, 
  Plus,
  Calendar,
  CheckCircle,
  Loader2,
  Search,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '@/lib/storage';
import { Project } from '@/lib/types';

export const ProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'name'>('recent');

  useEffect(() => {
    try {
      const loadedProjects = storageService.getProjects();
      setProjects(loadedProjects);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubmissionRate = (project: Project) => {
    if (!project.submissions || !project.memberCount) return 0;
    return (project.submissions.length / project.memberCount) * 100;
  };

  const getSubmissionCount = (project: Project) => {
    return project.submissions?.length || 0;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getProjectStatus = (project: Project) => {
    const submissionRate = getSubmissionRate(project);
    if (submissionRate === 100) return { label: 'Complete', color: 'bg-green-100 text-green-800' };
    if (submissionRate > 50) return { label: 'In Progress', color: 'bg-blue-100 text-blue-800' };
    if (submissionRate > 0) return { label: 'Started', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'New', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredAndSortedProjects = projects
    .filter(project => 
      project.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.occasion.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return getSubmissionRate(b) - getSubmissionRate(a);
        case 'name':
          return a.groupName.localeCompare(b.groupName);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Loading your projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-8">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 shadow-elegant">
            <Heart className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-medium text-primary">Your Memory Projects</span>
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-fade-in">
            Project Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create, manage, and share beautiful memory collages with your group
          </p>
        </div>
      </div>

      {/* Enhanced Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gradient-card p-6 rounded-xl shadow-elegant">
        <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'recent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('recent')}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              Recent
            </Button>
            <Button
              variant={sortBy === 'progress' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('progress')}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Progress
            </Button>
            <Button
              variant={sortBy === 'name' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('name')}
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Name
            </Button>
          </div>
        </div>

        {/* View Mode & Create Button */}
        <div className="flex gap-3 items-center">
          <div className="flex bg-muted/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            onClick={() => navigate('/create-project')}
            size="lg"
            variant="hero"
            className="gap-2 shadow-glow hover:scale-105 transition-transform"
          >
            <Plus className="w-5 h-5" />
            Create New Project
          </Button>
        </div>
      </div>

      {/* Projects Display */}
      {!filteredAndSortedProjects || filteredAndSortedProjects.length === 0 ? (
        searchTerm ? (
          <Card className="bg-gradient-card shadow-elegant">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">No projects found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No projects match "{searchTerm}". Try adjusting your search terms.
              </p>
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-elegant">
            <CardContent className="p-12 text-center space-y-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <Users className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-bold">Ready to create memories?</h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Start your first group memory project and bring everyone together
                </p>
              </div>
              <Button 
                onClick={() => navigate('/create-project')}
                size="lg"
                variant="hero"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }>
          {filteredAndSortedProjects.map((project) => {
            const status = getProjectStatus(project);
            const submissionRate = getSubmissionRate(project);
            
            return viewMode === 'grid' ? (
              <Card 
                key={project.id} 
                className="bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-300 hover:scale-105 group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                        {project.groupName}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(project.createdAt)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {project.occasion}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Submissions</span>
                      <span className="font-medium">
                        {getSubmissionCount(project)} / {project.memberCount || 0}
                      </span>
                    </div>
                    <Progress value={submissionRate} className="h-3" />
                    <div className="text-xs text-muted-foreground text-center">
                      {submissionRate.toFixed(0)}% complete
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{project.memberCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {getSubmissionCount(project) > 0 ? (
                          <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Submissions</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => navigate(`/my-project/${project.id}`)}
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                  >
                    View Project
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card 
                key={project.id} 
                className="bg-gradient-card shadow-elegant hover:shadow-glow transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{project.groupName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(project.createdAt)}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {project.occasion}
                          </Badge>
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{getSubmissionCount(project)}/{project.memberCount}</div>
                        <div className="text-xs text-muted-foreground">Submissions</div>
                      </div>
                      <div className="w-24">
                        <Progress value={submissionRate} className="h-2" />
                        <div className="text-xs text-center mt-1 text-muted-foreground">
                          {submissionRate.toFixed(0)}%
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate(`/my-project/${project.id}`)}
                        variant="hero"
                        className="gap-2"
                      >
                        View Project
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}; 
