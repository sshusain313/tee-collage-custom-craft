import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ProjectCreation from './pages/ProjectCreation';
import MemberUpload from './pages/MemberUpload';
import Login from './pages/Login';
import Register from './pages/Register';
import { HeroSection } from "./components/HeroSection";
import { CollageCanvas } from "./components/CollageCanvas";
import Checkout from "./pages/Checkout";
import Preview from "./pages/Preview";
import { useState } from "react";
import { ProjectDashboard } from "./components/ProjectDashboard";
import { ProjectsList } from "./components/ProjectsList";

const queryClient = new QueryClient();

const App = () => {
  const [canvasMode, setCanvasMode] = useState<'upload' | 'adjust'>('upload');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<HeroSection />} />
              <Route path="/create-collage" element={
                <CollageCanvas 
                  mode={canvasMode}
                  onModeChange={setCanvasMode}
                />
              } />
              
              {/* Protected routes */}
              <Route path="/create-project" element={
                <ProtectedRoute>
                  <ProjectCreation />
                </ProtectedRoute>
              } />
              <Route path="/upload-member" element={
                <ProtectedRoute>
                  <MemberUpload />
                </ProtectedRoute>
              } />
              <Route path="/my-projects" element={
                <ProtectedRoute>
                  <ProjectsList />
                </ProtectedRoute>
              } />
              <Route path="/my-project/:projectId" element={
                <ProtectedRoute>
                  <ProjectDashboard />
                </ProtectedRoute>
              } />
              <Route path="/preview/:projectId" element={
                <ProtectedRoute>
                  <Preview />
                </ProtectedRoute>
              } />
              <Route path="/checkout/:projectId" element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
