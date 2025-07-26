
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, Heart, Check } from 'lucide-react';
import { uxCopy } from '@/content/uxCopy';
import { CollageStyleCard, CollageStyle } from './CollageStyleCard';
import { storageService } from '@/lib/storage';
import { Project, MemberSubmission } from '@/lib/types';
import { useNavigate } from 'react-router-dom';

interface MemberUploadFormProps {
  projectId: string;
  groupName: string;
  occasion: string;
}

interface VoteData {
  hexagonal: number;
  square: number;
  circular: number;
}

// Define dynamic field configurations for each occasion
interface OccasionFieldConfig {
  additionalFields: Array<{
    key: string;
    label: string;
    placeholder: string;
    helper: string;
    type: 'text' | 'textarea';
  }>;
  copy: {
    title: string;
    subtitle: string;
    groupInfo: string;
  };
}

const occasionConfigs: Record<string, OccasionFieldConfig> = {
  'Graduation farewell': {
    additionalFields: [
      {
        key: 'degree',
        label: 'What degree are you graduating with?',
        placeholder: 'e.g., Computer Science, Business Administration',
        helper: 'This helps personalize your memory',
        type: 'text'
      },
      {
        key: 'favoriteMemory',
        label: 'Your favorite memory from this journey',
        placeholder: 'Share a special moment or achievement...',
        helper: 'A highlight that made this time special',
        type: 'textarea'
      }
    ],
    copy: {
      title: 'Add yourself to the graduation memory',
      subtitle: 'You\'re part of something special—let\'s capture this milestone',
      groupInfo: 'Contributing to: {groupName} Graduation'
    }
  },
  'Office send-off': {
    additionalFields: [
      {
        key: 'department',
        label: 'Your department or team',
        placeholder: 'e.g., Engineering, Marketing, Sales',
        helper: 'Help us organize the collage by teams',
        type: 'text'
      },
      {
        key: 'yearsOfService',
        label: 'How long have you been with the company?',
        placeholder: 'e.g., 3 years, 5 years, 10+ years',
        helper: 'A testament to your contribution',
        type: 'text'
      }
    ],
    copy: {
      title: 'Add yourself to the farewell memory',
      subtitle: 'You\'re part of something special—let\'s capture this transition',
      groupInfo: 'Contributing to: {groupName} Farewell'
    }
  },
  'Team farewell': {
    additionalFields: [
      {
        key: 'role',
        label: 'Your role in the team',
        placeholder: 'e.g., Team Lead, Developer, Designer',
        helper: 'Your contribution to the team',
        type: 'text'
      },
      {
        key: 'teamMemory',
        label: 'Best team memory or achievement',
        placeholder: 'Share a project success or team moment...',
        helper: 'A highlight that brought the team together',
        type: 'textarea'
      }
    ],
    copy: {
      title: 'Add yourself to the team memory',
      subtitle: 'You\'re part of something special—let\'s capture this bond',
      groupInfo: 'Contributing to: {groupName} Team'
    }
  },
  'Class reunion prep': {
    additionalFields: [
      {
        key: 'graduationYear',
        label: 'What year did you graduate?',
        placeholder: 'e.g., 2010, 2015, 2020',
        helper: 'Help us organize by graduation years',
        type: 'text'
      },
      {
        key: 'reunionMemory',
        label: 'What you\'re most excited about for the reunion',
        placeholder: 'Catching up with old friends, sharing life updates...',
        helper: 'What makes this reunion special for you',
        type: 'textarea'
      }
    ],
    copy: {
      title: 'Add yourself to the reunion memory',
      subtitle: 'You\'re part of something special—let\'s capture this reunion',
      groupInfo: 'Contributing to: {groupName} Reunion'
    }
  },
  'Project wrap-up': {
    additionalFields: [
      {
        key: 'projectRole',
        label: 'Your role in the project',
        placeholder: 'e.g., Project Manager, Developer, Designer',
        helper: 'Your contribution to the project success',
        type: 'text'
      },
      {
        key: 'projectHighlight',
        label: 'Biggest project achievement or learning',
        placeholder: 'Share a key milestone or breakthrough...',
        helper: 'What made this project memorable',
        type: 'textarea'
      }
    ],
    copy: {
      title: 'Add yourself to the project memory',
      subtitle: 'You\'re part of something special—let\'s capture this success',
      groupInfo: 'Contributing to: {groupName} Project'
    }
  },
  'Other celebration': {
    additionalFields: [
      {
        key: 'celebrationType',
        label: 'What are you celebrating?',
        placeholder: 'e.g., Birthday, Anniversary, Achievement',
        helper: 'Help us personalize your memory',
        type: 'text'
      },
      {
        key: 'celebrationMessage',
        label: 'Your celebration message or wish',
        placeholder: 'Share your excitement or well wishes...',
        helper: 'What makes this celebration special',
        type: 'textarea'
      }
    ],
    copy: {
      title: 'Add yourself to the celebration memory',
      subtitle: 'You\'re part of something special—let\'s capture this joy',
      groupInfo: 'Contributing to: {groupName} Celebration'
    }
  }
};

export const MemberUploadForm = ({ projectId, groupName, occasion }: MemberUploadFormProps) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    photo: null as File | null,
    name: '',
    role: '',
    message: '',
    collageStyle: 'hexagonal' as CollageStyle,
    // Dynamic fields will be added based on occasion
    ...Object.fromEntries(
      occasionConfigs[occasion]?.additionalFields.map(field => [field.key, '']) || []
    )
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadedProject = storageService.getProject(projectId);
    if (!loadedProject) {
      navigate('/'); // Redirect to home if project not found
      return;
    }
    setProject(loadedProject);

    // Check if user has already submitted (basic check using name - in real app would use user ID)
    const existingSubmission = loadedProject.submissions.find(
      submission => submission.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (existingSubmission) {
      setIsSubmitted(true);
    }
  }, [projectId, navigate, formData.name]);

  const copy = uxCopy.memberUpload;
  const occasionConfig = occasionConfigs[occasion] || occasionConfigs['Other celebration'];
  const dynamicCopy = {
    ...copy,
    title: occasionConfig.copy.title,
    subtitle: occasionConfig.copy.subtitle,
    groupInfo: occasionConfig.copy.groupInfo.replace('{groupName}', groupName)
  };

  const totalVotes = project ? (
    project.votes.hexagonal + project.votes.square + project.votes.circular
  ) : 0;
  
  const getPercentage = (style: keyof Project['votes']) => {
    if (!project || totalVotes === 0) return 0;
    return Math.round((project.votes[style] / totalVotes) * 100);
  };

  const collageStyles = [
    { style: 'hexagonal' as CollageStyle, label: 'Hexagonal' },
    { style: 'square' as CollageStyle, label: 'Square Grid' },
    { style: 'circular' as CollageStyle, label: 'Circular' }
  ];

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate required fields
    if (!formData.photo) {
      errors.photo = 'Photo is required';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    // Validate dynamic fields based on occasion
    occasionConfig.additionalFields.forEach(field => {
      const value = formData[field.key as keyof typeof formData] as string;
      if (!value?.trim()) {
        errors[field.key] = `${field.label} is required`;
      }
    });

    // Check for duplicate name (simple check - in real app would use user authentication)
    if (project && formData.name.trim()) {
      const existingSubmission = project.submissions.find(
        submission => submission.name.toLowerCase() === formData.name.toLowerCase().trim()
      );
      if (existingSubmission) {
        errors.name = 'A member with this name has already submitted';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!project) {
      console.error('Project not found');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert photo to base64
      const photoBase64 = await storageService.convertFileToBase64(formData.photo!);

      // Get dynamic field values
      const occasionFields = Object.fromEntries(
        occasionConfig.additionalFields.map(field => [
          field.key,
          (formData[field.key as keyof typeof formData] as string).trim()
        ])
      );

      // Create submission object
      const submission: MemberSubmission = {
        id: storageService.generateId(),
        projectId,
        name: formData.name.trim(),
        photo: photoBase64,
        role: formData.role?.trim() || undefined,
        message: formData.message?.trim() || undefined,
        collageStyle: formData.collageStyle,
        hasVoted: hasVoted,
        submittedAt: new Date().toISOString(),
        occasionFields
      };

      // Save submission to localStorage
      storageService.saveSubmission(submission);

      // Update votes if user voted
      if (hasVoted) {
        storageService.updateVotes(projectId, formData.collageStyle);
      }

      // Update local project state to reflect changes
      const updatedProject = storageService.getProject(projectId);
      if (updatedProject) {
        setProject(updatedProject);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationErrors({ 
        submit: 'An error occurred while submitting. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors(prev => ({ 
          ...prev, 
          photo: 'Photo must be smaller than 10MB' 
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationErrors(prev => ({ 
          ...prev, 
          photo: 'Please select a valid image file' 
        }));
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
      setValidationErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleVote = (style: CollageStyle) => {
    if (hasVoted || !project) return;
    
    setFormData(prev => ({ ...prev, collageStyle: style }));
    setHasVoted(true);
  };

  const handleStyleSelect = (style: CollageStyle) => {
    setFormData(prev => ({ ...prev, collageStyle: style }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderDynamicField = (field: OccasionFieldConfig['additionalFields'][0]) => {
    const commonProps = {
      id: field.key,
      placeholder: field.placeholder,
      value: formData[field.key as keyof typeof formData] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleInputChange(field.key, e.target.value),
      className: `bg-background/50 ${validationErrors[field.key] ? 'border-red-500' : ''}`
    };

    if (field.type === 'textarea') {
      return (
        <Textarea
          {...commonProps}
          className={`bg-background/50 min-h-[80px] ${validationErrors[field.key] ? 'border-red-500' : ''}`}
          rows={3}
        />
      );
    }

    return <Input {...commonProps} />;
  };

  if (!project) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto p-6 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-green-600">
            {copy.success.title}
          </h2>
          <p className="text-muted-foreground">
            {copy.success.message.replace('{groupName}', groupName)}
          </p>
        </div>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-green-700">
              {copy.success.next}
            </p>
          </CardContent>
        </Card>
        <Button 
          onClick={() => navigate('/')} 
          variant="outline"
          className="mt-4"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 py-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">You're Almost There!</span>
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">
          {dynamicCopy.title}
        </h1>
        <p className="text-muted-foreground">
          {dynamicCopy.subtitle}
        </p>
        <div className="text-sm text-primary font-medium">
          {dynamicCopy.groupInfo}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Member Upload Form */}
        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5" />
              Add your details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-sm font-medium">
                  {copy.form.photo.label}
                </Label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors ${
                  validationErrors.photo ? 'border-red-500' : 'border-muted-foreground/25'
                }`}>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    required
                  />
                  <label htmlFor="photo" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {copy.form.photo.uploadText}
                    </span>
                    {formData.photo && (
                      <span className="text-xs text-primary font-medium">
                        {formData.photo.name}
                      </span>
                    )}
                  </label>
                </div>
                {validationErrors.photo && (
                  <p className="text-xs text-red-500">{validationErrors.photo}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {copy.form.photo.helper}
                </p>
                <p className="text-xs text-muted-foreground">
                  {copy.form.photo.requirements}
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  {copy.form.name.label}
                </Label>
                <Input
                  id="name"
                  placeholder={copy.form.name.placeholder}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`bg-background/50 ${validationErrors.name ? 'border-red-500' : ''}`}
                  required
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-500">{validationErrors.name}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {copy.form.name.helper}
                </p>
              </div>

              {/* Dynamic Fields based on Occasion */}
              {occasionConfig.additionalFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                  </Label>
                  {renderDynamicField(field)}
                  {validationErrors[field.key] && (
                    <p className="text-xs text-red-500">{validationErrors[field.key]}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {field.helper}
                  </p>
                </div>
              ))}

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  {copy.form.message.label}
                </Label>
                <Textarea
                  id="message"
                  placeholder={copy.form.message.placeholder}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="bg-background/50 min-h-[80px]"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {copy.form.message.helper}
                </p>
              </div>

              {/* Collage Style Selection with Voting */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Choose Collage Style & Vote
                </Label>
                <p className="text-xs text-muted-foreground">
                  Select your preferred style and vote to help your group decide!
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {collageStyles.map(({ style, label }) => (
                    <div key={style} className="space-y-2">
                      <CollageStyleCard
                        style={style}
                        label={label}
                        isSelected={formData.collageStyle === style}
                        onSelect={handleStyleSelect}
                        votes={project?.votes[style] || 0}
                        percentage={getPercentage(style)}
                        showVoting={true}
                      />
                      {!hasVoted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(style)}
                          className="w-full"
                        >
                          Vote for {label}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {hasVoted && (
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <Check className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-green-700 font-medium">
                      Thanks for voting! Your voice has been counted.
                    </p>
                  </div>
                )}

                <div className="text-center text-xs text-muted-foreground">
                  Total votes: {totalVotes}
                </div>
              </div>

              {/* General submission error */}
              {validationErrors.submit && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">{validationErrors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding to collage...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    {copy.cta}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
