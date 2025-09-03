import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthGuard from "@/components/AuthGuard";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthReset from "./pages/AuthReset";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import BoardsPage from "./pages/BoardsPage";
import BoardDetail from "./pages/BoardDetail";
import TasksPage from "./pages/TasksPage";
import LandingPage from "./components/LandingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="workflow-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/dashboard" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/reset" element={<AuthReset />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/tasks" element={
                <AuthGuard>
                  <TasksPage />
                </AuthGuard>
              } />
              <Route path="/tasks/boards" element={
                <AuthGuard>
                  <TasksPage />
                </AuthGuard>
              } />
              <Route path="/tasks/boards/:projectId" element={
                <AuthGuard>
                  <DashboardLayout>
                    <BoardDetail />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/calendar" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/chat" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/email" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/files" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/courses" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/hr" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/team" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/integrations" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/marketplace" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <DashboardLayout>
                    <Index hideSidebar={true} />
                  </DashboardLayout>
                </AuthGuard>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
