
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Camera, Heart, Check, Vote } from 'lucide-react';
import { uxCopy } from '@/content/uxCopy';
import { CollageStyleCard, CollageStyle } from './CollageStyleCard';

interface MemberUploadFormProps {
  projectId: string;
  groupName: string;
}

interface VoteData {
  hexagonal: number;
  square: number;
  circular: number;
}

export const MemberUploadForm = ({ projectId, groupName }: MemberUploadFormProps) => {
  const [formData, setFormData] = useState({
    photo: null as File | null,
    name: '',
    role: '',
    message: '',
    collageStyle: 'hexagonal' as CollageStyle
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState<VoteData>({
    hexagonal: 12,
    square: 8,
    circular: 5
  });

  const copy = uxCopy.memberUpload;

  const totalVotes = votes.hexagonal + votes.square + votes.circular;
  const getPercentage = (count: number) => totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

  const collageStyles = [
    { style: 'hexagonal' as CollageStyle, label: 'Hexagonal' },
    { style: 'square' as CollageStyle, label: 'Square Grid' },
    { style: 'circular' as CollageStyle, label: 'Circular' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting member data:', formData);
    setIsSubmitted(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  const handleVote = (style: CollageStyle) => {
    if (hasVoted) return;
    
    setVotes(prev => ({
      ...prev,
      [style]: prev[style] + 1
    }));
    setHasVoted(true);
    
    // TODO: Send vote to backend
    console.log('Voted for style:', style);
  };

  const handleStyleSelect = (style: CollageStyle) => {
    setFormData(prev => ({ ...prev, collageStyle: style }));
  };

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
          {copy.title}
        </h1>
        <p className="text-muted-foreground">
          {copy.subtitle}
        </p>
        <div className="text-sm text-primary font-medium">
          {copy.groupInfo.replace('{groupName}', groupName)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
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
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {copy.form.name.helper}
                </p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  {copy.form.role.label}
                </Label>
                <Input
                  id="role"
                  placeholder={copy.form.role.placeholder}
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  {copy.form.role.helper}
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  {copy.form.message.label}
                </Label>
                <Textarea
                  id="message"
                  placeholder={copy.form.message.placeholder}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-background/50 min-h-[80px]"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {copy.form.message.helper}
                </p>
              </div>

              {/* Collage Style Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Choose Collage Style
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {collageStyles.map(({ style, label }) => (
                    <CollageStyleCard
                      key={style}
                      style={style}
                      label={label}
                      isSelected={formData.collageStyle === style}
                      onSelect={handleStyleSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={!formData.photo || !formData.name}
              >
                <Heart className="w-4 h-4 mr-2" />
                {copy.cta}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Voting Section */}
        <Card className="bg-gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Vote className="w-5 h-5" />
              Vote for Your Favorite Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Help your group decide! Vote for your favorite collage style. You can only vote once.
              </p>
              
              <div className="space-y-4">
                {collageStyles.map(({ style, label }) => (
                  <div key={style}>
                    <CollageStyleCard
                      style={style}
                      label={label}
                      isSelected={false}
                      onSelect={handleVote}
                      votes={votes[style]}
                      percentage={getPercentage(votes[style])}
                      showVoting={true}
                    />
                    {!hasVoted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVote(style)}
                        className="w-full mt-2"
                      >
                        Vote for {label}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {hasVoted && (
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Check className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">
                    Thanks for voting! Your voice has been counted.
                  </p>
                </div>
              )}

              <div className="text-center text-xs text-muted-foreground">
                Total votes: {totalVotes}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
