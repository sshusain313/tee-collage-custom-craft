import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Shirt, Camera } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="py-16 bg-gradient-hero relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Create • Customize • Print</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Turn Your Photos Into
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Stunning T-Shirt Art
            </span>
          </h1>

          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Create beautiful hexagonal photo collages and get them printed on premium quality t-shirts. 
            Upload your memories, design your masterpiece, and wear your story.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8">
              <Camera className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
              <Shirt className="w-5 h-5 mr-2" />
              Shop Designs
            </Button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Camera className="w-8 h-8 text-yellow-300 mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Upload & Arrange</h3>
              <p className="text-sm text-white/80">
                Upload your favorite photos and arrange them in beautiful hexagonal patterns
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Sparkles className="w-8 h-8 text-pink-300 mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Customize Design</h3>
              <p className="text-sm text-white/80">
                Resize, rotate, and position each photo to create your perfect collage
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Shirt className="w-8 h-8 text-blue-300 mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Print & Wear</h3>
              <p className="text-sm text-white/80">
                Get your design printed on premium quality t-shirts and wear your memories
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};