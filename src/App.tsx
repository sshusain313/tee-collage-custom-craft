import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ProjectCreation from './pages/ProjectCreation';
import MemberUpload from './pages/MemberUpload';
import { HeroSection } from "./components/HeroSection";
import { CollageCanvas } from "./components/CollageCanvas";
// import { PreviewSummary } from "./pages/PreviewSummary";
import Checkout from "./pages/Checkout";
import MyProject from "./pages/MyProject";
import Preview from "./pages/Preview";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [canvasMode, setCanvasMode] = useState<'upload' | 'adjust'>('upload');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/create-project" element={<ProjectCreation />} />
            <Route path="/upload-member" element={<MemberUpload />} />
            <Route path="/my-project" element={<MyProject />} />
            <Route path="/preview/:projectId" element={<Preview />} />
            <Route path="/checkout/:projectId" element={<Checkout />} />
            <Route path="/" element={<HeroSection />} />
            <Route path="/create-collage" element={
              <CollageCanvas 
                mode={canvasMode}
                onModeChange={setCanvasMode}
              />
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
