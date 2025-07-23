import { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Toaster as AppToaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <TooltipProvider>
    <Header />
    <main className="min-h-[80vh] flex flex-col items-center justify-center bg-background py-8">
      {/* <Card className="w-full max-w-5xl mx-auto p-6 bg-gradient-card shadow-elegant"> */}
        {children}
      {/* </Card> */}
    </main>
    <footer className="w-full text-center py-4 text-muted-foreground text-xs border-t bg-background/80">
      &copy; {new Date().getFullYear()} TeeCollage. All rights reserved.
    </footer>
    <AppToaster />
    <Sonner />
  </TooltipProvider>
);

export default Layout;
