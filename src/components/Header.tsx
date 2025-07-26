import { Button } from '@/components/ui/button';
import { ShoppingCart, Palette } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import UserProfile from './UserProfile';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TeeCollage
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/create-project" className="text-foreground hover:text-primary transition-colors">
                  Create Project
                </Link>
                <Link to="/my-projects" className="text-foreground hover:text-primary transition-colors">
                  My Projects
                </Link>
              </>
            )}
            <Link to="/create-collage" className="text-foreground hover:text-primary transition-colors">
              Create Collage
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="sm">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Cart (0)</span>
                </Button>
                <UserProfile />
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};