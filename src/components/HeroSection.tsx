
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Users, Share2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <Layout>
    <section className="py-16 bg-gradient-hero relative overflow-hidden w-full">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Together • Forever • Wearable</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Your Last Chapter Together,
            <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              Worn Close to the Heart
            </span>
          </h1>

          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Create beautiful collaborative photo collages with your team, classmates, or colleagues. 
            One shared link brings everyone together for a farewell gift that captures every smile, 
            every memory, and every face that made the journey special.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="hero" size="lg" className="text-lg px-8">
              <Link to="/create-collage">
              <Users className="w-5 h-5 mr-2" />
              Start My Project
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
              <Share2 className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
          </div>

          {/* Process overview */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Three Simple Steps to Forever</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              From "see you later" to "I'll wear you close to my heart" – 
              creating your group's perfect farewell memento has never been easier.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Share2 className="w-8 h-8 text-blue-300 mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Share the Link</h3>
              <p className="text-sm text-white/80">
                Create your project and share one magic link with everyone. No apps to download, 
                no accounts needed – just pure simplicity.
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Users className="w-8 h-8 text-pink-300 mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Everyone Contributes</h3>
              <p className="text-sm text-white/80">
                Each person uploads their favorite photo and adds their name. 
                Watch as your group comes together, one smile at a time.
              </p>
            </Card>

            <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <Heart className="w-8 h-8 text-yellow-300 mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Design & Treasure</h3>
              <p className="text-sm text-white/80">
                Arrange everyone's photos into a beautiful collage, preview it on premium t-shirts, 
                and order for the whole group. Memories you can wear.
              </p>
            </Card>
          </div>

          {/* Emotional hook */}
          <div className="mt-16 p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              "The best goodbyes are the ones you can hold onto"
            </h3>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              Whether it's graduation, a job change, or the end of a project – some chapters deserve 
              more than just a group chat. Create something tangible that captures the magic of your 
              time together. Because years from now, you'll want to remember not just the work you did, 
              but the faces you did it with.
            </p>
            <Button variant="hero" size="lg" className="text-lg px-8">
              Create Our Memory
            </Button>
          </div>
        </div>
      </div>
    </section>
    </Layout>
  );
};
