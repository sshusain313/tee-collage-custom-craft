
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Heart, Users, Sparkles, AlertCircle } from 'lucide-react';
import { uxCopy } from '@/content/uxCopy';
import { useNavigate } from 'react-router-dom';
import { storageService } from '@/lib/storage';
import { Project, VoteData } from '@/lib/types';

export const ProjectCreationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    groupName: '',
    occasion: '',
    memberCount: '',
    gridStyle: 'hexagonal',
    schoolLogo: null as File | null
  });

  const copy = uxCopy.projectCreation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate project ID
      const projectId = storageService.generateId();
      
      // Convert school logo to base64 if exists
      let schoolLogoBase64 = '';
      if (formData.schoolLogo) {
        schoolLogoBase64 = await storageService.convertFileToBase64(formData.schoolLogo);
      }
      
      // Create project object
      const project: Project = {
        id: projectId,
        groupName: formData.groupName,
        occasion: formData.occasion,
        memberCount: parseInt(formData.memberCount),
        gridStyle: formData.gridStyle as any,
        schoolLogo: schoolLogoBase64,
        createdAt: new Date().toISOString(),
        submissions: [],
        votes: {
          hexagonal: 0,
          square: 0,
          circular: 0
        }
      };
      
      // Save to localStorage
      const success = storageService.saveProject(project);
      
      if (success) {
        // Navigate to projects list
        navigate('/my-projects');
      } else {
        setError('Failed to save project. Your browser storage might be full. Please try clearing some data or use a smaller image.');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating your project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Please select an image smaller than 5MB.');
        return;
      }
      setError(null);
      setFormData(prev => ({ ...prev, schoolLogo: file }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Together • Forever • Wearable</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {copy.title}
        </h1>
        <p className="text-lg text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      {/* Form */}
      <Card className="bg-gradient-card shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Let's set up your memory project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="groupName" className="text-sm font-medium">
                {copy.form.groupName.label}
              </Label>
              <Input
                id="groupName"
                placeholder={copy.form.groupName.placeholder}
                value={formData.groupName}
                onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                {copy.form.groupName.helper}
              </p>
            </div>

            {/* Occasion */}
            <div className="space-y-2">
              <Label htmlFor="occasion" className="text-sm font-medium">
                {copy.form.occasion.label}
              </Label>
              <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={copy.form.occasion.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {copy.form.occasion.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Member Count */}
            <div className="space-y-2">
              <Label htmlFor="memberCount" className="text-sm font-medium">
                {copy.form.memberCount.label}
              </Label>
              <Input
                id="memberCount"
                type="number"
                placeholder={copy.form.memberCount.placeholder}
                value={formData.memberCount}
                onChange={(e) => setFormData(prev => ({ ...prev, memberCount: e.target.value }))}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                {copy.form.memberCount.helper}
              </p>
            </div>

            {/* Grid Style */}
            <div className="space-y-2">
              <Label htmlFor="gridStyle" className="text-sm font-medium">
                {copy.form.gridStyle.label}
              </Label>
              <Select value={formData.gridStyle} onValueChange={(value) => setFormData(prev => ({ ...prev, gridStyle: value }))}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(copy.form.gridStyle.options).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {copy.form.gridStyle.helper}
              </p>
            </div>

            {/* School Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="schoolLogo" className="text-sm font-medium">
                {copy.form.schoolLogo.label}
              </Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="schoolLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <label htmlFor="schoolLogo" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {copy.form.schoolLogo.uploadText}
                  </span>
                  {formData.schoolLogo && (
                    <span className="text-xs text-primary font-medium">
                      {formData.schoolLogo.name}
                    </span>
                  )}
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {copy.form.schoolLogo.helper}
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!formData.groupName || !formData.occasion || !formData.memberCount || isLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isLoading ? 'Creating project...' : copy.cta}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* What happens next preview */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            What happens next:
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✨ You'll get a magic link to share with everyone</p>
            <p>📸 Each person uploads their photo and name</p>
            <p>🎨 You design the perfect collage layout</p>
            <p>👕 Order beautiful T-shirts for the whole group</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
