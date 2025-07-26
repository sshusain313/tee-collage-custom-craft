import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Heart, 
  ArrowRight, 
  Plus,
  Calendar,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '@/lib/storage';
import { Project } from '@/lib/types';

export const ProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-2 text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Your Memory Projects</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Project Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage all your group memory projects
        </p>
      </div>

      {/* Create New Project Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => navigate('/create-project')}
          size="lg"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {!projects || projects.length === 0 ? (
        <Card className="bg-gradient-card shadow-elegant">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Projects Yet</h3>
            <p className="text-muted-foreground">
              Start by creating your first group memory project
            </p>
            <Button 
              onClick={() => navigate('/create-project')}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-gradient-card shadow-elegant hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{project.groupName}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {formatDate(project.createdAt)}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {project.occasion}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Submissions</span>
                    <span className="font-medium">
                      {getSubmissionCount(project)} / {project.memberCount || 0}
                    </span>
                  </div>
                  <Progress value={getSubmissionRate(project)} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 py-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{project.memberCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {getSubmissionCount(project) > 0 ? (
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto" />
                      ) : (
                        '0'
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Submissions</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => navigate(`/my-project/${project.id}`)}
                  className="w-full gap-2"
                >
                  View Project
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}; 