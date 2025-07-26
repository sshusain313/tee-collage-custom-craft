
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
                      <Card 
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md relative ${
                          formData.collageStyle === style 
                            ? 'ring-2 ring-primary bg-primary/5 border-primary' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleStyleSelect(style)}
                      >
                        <CardContent className="p-4">
                          <div className="text-center space-y-3">
                            {/* Collage Style Image */}
                            <div className="relative w-full h-32 flex items-center justify-center">
                              <img
                                src={style === 'circular' ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jaXJjbGUgeyBmaWxsOiB3aGl0ZTsgc3Ryb2tlOiAjOGI1Y2Y2OyBzdHJva2Utd2lkdGg6IDI7IH0KICAgICAgLmJhY2tncm91bmQgeyBmaWxsOiB3aGl0ZTsgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgCiAgPCEtLSBCYWNrZ3JvdW5kIC0tPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBjbGFzcz0iYmFja2dyb3VuZCIvPgogIAogIDwhLS0gQ2VudHJhbCBsYXJnZSBjaXJjbGUgLS0+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIyNSIgY2xhc3M9ImNpcmNsZSIvPgogIAogIDwhLS0gOCBzdXJyb3VuZGluZyBjaXJjbGVzIC0tPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjUwIiByPSI4IiBjbGFzcz0iY2lyY2xlIi8+CiAgPGNpcmNsZSBjeD0iMTQwIiBjeT0iNjAiIHI9IjgiIGNsYXNzPSJjaXJjbGUiLz4KICA8Y2lyY2xlIGN4PSIxNjAiIGN5PSIxMDAiIHI9IjgiIGNsYXNzPSJjaXJjbGUiLz4KICA8Y2lyY2xlIGN4PSIxNDAiIGN5PSIxNDAiIHI9IjgiIGNsYXNzPSJjaXJjbGUiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxNTAiIHI9IjgiIGNsYXNzPSJjaXJjbGUiLz4KICA8Y2lyY2xlIGN4PSI2MCIgY3k9IjE0MCIgcj0iOCIgY2xhc3M9ImNpcmNsZSIvPgogIDxjaXJjbGUgY3g9IjQwIiBjeT0iMTAwIiByPSI4IiBjbGFzcz0iY2lyY2xlIi8+CiAgPGNpcmNsZSBjeD0iNjAiIGN5PSI2MCIgcj0iOCIgY2xhc3M9ImNpcmNsZSIvPgo8L3N2Zz4=' :
                                       style === 'square' ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5zcXVhcmUgeyBmaWxsOiB3aGl0ZTsgc3Ryb2tlOiAjZWM0ODk5OyBzdHJva2Utd2lkdGg6IDI7IH0KICAgICAgLmJhY2tncm91bmQgeyBmaWxsOiB3aGl0ZTsgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgCiAgPCEtLSBCYWNrZ3JvdW5kIC0tPgogIDxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBjbGFzcz0iYmFja2dyb3VuZCIvPgogIAogIDwhLS0gQ2VudHJhbCBsYXJnZSBzcXVhcmUgLS0+CiAgPHJlY3QgeD0iNzUiIHk9Ijc1IiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGNsYXNzPSJzcXVhcmUiLz4KICAKICA8IS0tIFRvcCByb3cgLSA0IHNxdWFyZXMgLS0+CiAgPHJlY3QgeD0iNjAiIHk9IjQwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGNsYXNzPSJzcXVhcmUiLz4KICA8cmVjdCB4PSI4MCIgeT0iNDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIDxyZWN0IHg9IjEwMCIgeT0iNDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIDxyZWN0IHg9IjEyMCIgeT0iNDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIAogIDwhLS0gTGVmdCBjb2x1bW4gLSAzIHNxdWFyZXMgLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjYwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGNsYXNzPSJzcXVhcmUiLz4KICA8cmVjdCB4PSI0MCIgeT0iODAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIDxyZWN0IHg9IjQwIiB5PSIxMDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIAogIDwhLS0gUmlnaHQgY29sdW1uIC0gMyBzcXVhcmVzIC0tPgogIDxyZWN0IHg9IjE0MCIgeT0iNjAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIDxyZWN0IHg9IjE0MCIgeT0iODAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIDxyZWN0IHg9IjE0MCIgeT0iMTAwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGNsYXNzPSJzcXVhcmUiLz4KICAKICA8IS0tIEJvdHRvbSByb3cgLSA0IHNxdWFyZXMgLS0+CiAgPHJlY3QgeD0iNjAiIHk9IjE0MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBjbGFzcz0ic3F1YXJlIi8+CiAgPHJlY3QgeD0iODAiIHk9IjE0MCIgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiBjbGFzcz0ic3F1YXJlIi8+CiAgPHJlY3QgeD0iMTAwIiB5PSIxNDAiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgY2xhc3M9InNxdWFyZSIvPgogIDxyZWN0IHg9IjEyMCIgeT0iMTQwIiB3aWR0aD0iMTUiIGhlaWdodD0iMTUiIGNsYXNzPSJzcXVhcmUiLz4KPC9zdmc+' :
                                       'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5oZXhhZ29uIHsgZmlsbDogd2hpdGU7IHN0cm9rZTogIzhiNWNmNjsgc3Ryb2tlLXdpZHRoOiAyOyB9CiAgICAgIC5iYWNrZ3JvdW5kIHsgZmlsbDogd2hpdGU7IH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIAogIDwhLS0gQmFja2dyb3VuZCAtLT4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgY2xhc3M9ImJhY2tncm91bmQiLz4KICAKICA8IS0tIENlbnRyYWwgbGFyZ2UgaGV4YWdvbiAtLT4KICA8cG9seWdvbiBwb2ludHM9IjEwMCw2MCAxMzAsNzUgMTMwLDEwNSAxMDAsMTIwIDcwLDEwNSA3MCw3NSIgY2xhc3M9ImhleGFnb24iLz4KICAKICA8IS0tIDYgc3Vycm91bmRpbmcgaGV4YWdvbnMgLS0+CiAgPHBvbHlnb24gcG9pbnRzPSIxMDAsMzAgMTE1LDM3LjUgMTE1LDUyLjUgMTAwLDYwIDg1LDUyLjUgODUsMzcuNSIgY2xhc3M9ImhleGFnb24iLz4KICA8cG9seWdvbiBwb2ludHM9IjE0NSw0NSAxNjAsNTIuNSAxNjAsNjcuNSAxNDUsNzUgMTMwLDY3LjUgMTMwLDUyLjUiIGNsYXNzPSJoZXhhZ29uIi8+CiAgPHBvbHlnb24gcG9pbnRzPSIxNDUsMTA1IDE2MCwxMTIuNSAxNjAsMTI3LjUgMTQ1LDEzNSAxMzAsMTI3LjUgMTMwLDExMi41IiBjbGFzcz0iaGV4YWdvbiIvPgogIDxwb2x5Z29uIHBvaW50cz0iMTAwLDE1MCAxMTUsMTU3LjUgMTE1LDE3Mi41IDEwMCwxODAgODUsMTcyLjUgODUsMTU3LjUiIGNsYXNzPSJoZXhhZ29uIi8+CiAgPHBvbHlnb24gcG9pbnRzPSI1NSwxMDUgNzAsMTEyLjUgNzAsMTI3LjUgNTUsMTM1IDQwLDEyNy41IDQwLDExMi41IiBjbGFzcz0iaGV4YWdvbiIvPgogIDxwb2x5Z29uIHBvaW50cz0iNTUsNDUgNzAsNTIuNSA3MCw2Ny41IDU1LDc1IDQwLDY3LjUgNDAsNTIuNSIgY2xhc3M9ImhleGFnb24iLz4KPC9zdmc+'}
                                alt={`${label} collage style`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Fallback to CSS preview if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'block';
                                }}
                              />
                              {/* CSS Fallback Preview */}
                              <div 
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ display: 'none' }}
                              >
                                {style === 'hexagonal' && (
                                  <div className="relative w-full h-32 flex items-center justify-center">
                                    <div className="border-2 border-primary bg-primary/5 w-12 h-12" style={{
                                      clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                                    }} />
                                    {[0, 1, 2, 3, 4, 5].map((i) => {
                                      const angle = (Math.PI / 3) * i;
                                      const x = 20 * Math.cos(angle);
                                      const y = 20 * Math.sin(angle);
                                      return (
                                        <div
                                          key={i}
                                          className="border-2 border-primary bg-primary/5 w-6 h-6 absolute"
                                          style={{
                                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                            transform: `translate(${x}px, ${y}px)`
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                                {style === 'square' && (
                                  <div className="relative w-full h-32 flex items-center justify-center">
                                    <div className="grid grid-cols-4 gap-1 w-20 h-20">
                                      {[...Array(16)].map((_, i) => {
                                        const isCenter = (i === 5 || i === 6 || i === 9 || i === 10);
                                        if (isCenter && i === 5) {
                                          return (
                                            <div
                                              key={i}
                                              className="border-2 border-primary bg-primary/5 col-span-2 row-span-2"
                                              style={{ position: 'relative', gridColumn: '2 / 4', gridRow: '2 / 4' }}
                                            />
                                          );
                                        }
                                        if (isCenter) return <div key={i} />;
                                        return <div key={i} className="border-2 border-primary bg-primary/5 w-4 h-4" />;
                                      })}
                                    </div>
                                  </div>
                                )}
                                {style === 'circular' && (
                                  <div className="relative w-full h-32 flex items-center justify-center">
                                    <div className="border-2 border-primary bg-primary/5 w-10 h-10 rounded-full" />
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                                      const angle = (Math.PI * 2 * i) / 8;
                                      const x = 18 * Math.cos(angle);
                                      const y = 18 * Math.sin(angle);
                                      return (
                                        <div
                                          key={i}
                                          className="border-2 border-primary bg-primary/5 w-5 h-5 rounded-full absolute"
                                          style={{
                                            transform: `translate(${x}px, ${y}px)`
                                          }}
                                        />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <h4 className="font-medium text-sm">{label}</h4>
                              
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">
                                  {project?.votes[style] || 0} votes ({getPercentage(style)}%)
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                  <div 
                                    className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${getPercentage(style)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {formData.collageStyle === style && (
                            <div className="absolute -top-2 -right-2">
                              <div className="bg-primary rounded-full p-1">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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
