import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Palette } from 'lucide-react';

export const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TeeCollage
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="/create-collage" className="text-foreground hover:text-primary transition-colors">
              Create
            </a>
            <a href="/gallery" className="text-foreground hover:text-primary transition-colors">
              Gallery
            </a>
            <a href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Account</span>
            </Button>
            <Button variant="outline" size="sm">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline ml-2">Cart (0)</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};