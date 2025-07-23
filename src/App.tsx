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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/create-project" element={<ProjectCreation />} />
          <Route path="/upload-member" element={<MemberUpload />} />
          <Route path="/" element={<HeroSection />} />
          <Route path="/create-collage" element={<CollageCanvas />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
