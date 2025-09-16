import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ChatSection from '@/components/sections/ChatSection';
import TasksSection from '@/components/sections/TasksSection';
import CalendarModule from '@/components/calendar/CalendarModule';
import FileManager from '@/components/files/FileManager';
import CourseBuilder from '@/components/courses/CourseBuilder';
import CourseCatalog from '@/components/courses/CourseCatalog';
import CourseDashboard from '@/components/courses/CourseDashboard';
import TimeTracking from '@/components/hr/TimeTracking';
import IntegrationsSection from '@/components/sections/IntegrationsSection';
import EmailSection from '@/components/sections/EmailSection';
import TeamManagement from '@/components/team/TeamManagement';
import IntegrationMarketplace from '@/components/integrations/IntegrationMarketplace';
import GlobalSearch from '@/components/search/GlobalSearch';
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt';
import { CommandPalette } from '@/components/CommandPalette';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, User, Search } from 'lucide-react';

interface IndexProps {
  hideSidebar?: boolean;
}

const Index: React.FC<IndexProps> = ({ hideSidebar = false }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [commandOpen, setCommandOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/tasks/boards')) {
      setActiveSection('tasks');
    } else if (path === '/dashboard') {
      setActiveSection('dashboard');
    } else if (path === '/chat') {
      setActiveSection('chat');
    } else if (path === '/email') {
      setActiveSection('email');
    } else if (path === '/calendar') {
      setActiveSection('calendar');
    } else if (path === '/files') {
      setActiveSection('files');
    } else if (path === '/courses') {
      setActiveSection('courses');
    } else if (path === '/hr') {
      setActiveSection('hr');
    } else if (path === '/team') {
      setActiveSection('team');
    } else if (path === '/integrations') {
      setActiveSection('integrations');
    } else if (path === '/marketplace') {
      setActiveSection('marketplace');
    } else if (path === '/settings') {
      setActiveSection('settings');
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkAuth = () => {
      if (!isLoading && !user) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [user, isLoading, navigate]);

  // Debug logging
  console.log('🔍 Index: Auth state:', { user, profile, isLoading });
  console.log('🔍 Index: Current pathname:', location.pathname);

  // Redirect if loading
  if (isLoading) {
    console.log('⏳ Index: Still loading, showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Loading WorkFlow</h2>
            <p className="text-muted-foreground">Setting up your workspace...</p>
            <p className="text-sm text-muted-foreground">User: {user?.email || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">Profile: {profile ? 'Loaded' : 'Loading...'}</p>
            <p className="text-sm text-muted-foreground">Organization: {profile?.organization_id || 'None'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🚫 Index: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Check if profile is loaded but missing organization
  if (user && profile && !profile.organization_id) {
    console.log('🏢 Index: User has profile but no organization, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If profile is still loading, show loading
  if (user && !profile) {
    console.log('⏳ Index: User authenticated but profile not loaded yet, showing loading');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-surface">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Loading Profile</h2>
            <p className="text-muted-foreground">Setting up your profile...</p>
            <p className="text-sm text-muted-foreground">User: {user.email}</p>
            <p className="text-sm text-muted-foreground">Profile: Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Navigate to the correct route
    switch (section) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'email':
        navigate('/email');
        break;
      case 'tasks':
        navigate('/tasks/boards');
        break;
      case 'calendar':
        navigate('/calendar');
        break;
      case 'files':
        navigate('/files');
        break;
      case 'courses':
        navigate('/courses');
        break;
      case 'hr':
        navigate('/hr');
        break;
      case 'team':
        navigate('/team');
        break;
      case 'integrations':
        navigate('/integrations');
        break;
      case 'marketplace':
        navigate('/marketplace');
        break;
      case 'settings':
        navigate('/settings');
        break;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const renderSection = () => {
    console.log('🎯 renderSection: Active section is:', activeSection);
    
    switch (activeSection) {
      case 'dashboard':
        console.log('📊 Rendering DashboardOverview');
        return <DashboardOverview />;
      case 'chat':
        console.log('💬 Rendering ChatSection');
        return <ChatSection />;
      case 'email':
        console.log('📧 Rendering EmailSection');
        return <EmailSection />;
      case 'tasks':
        console.log('✅ Rendering TasksSection');
        return <TasksSection />;
      case 'calendar':
        console.log('📅 Rendering CalendarModule');
        return <CalendarModule />;
      case 'files':
        console.log('📁 Rendering FileManager');
        return <FileManager />;
      case 'courses':
        console.log('🎓 Rendering CourseBuilder');
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Course Platform</h1>
                <p className="text-muted-foreground">Create, manage, and learn from courses</p>
              </div>
            </div>
            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="builder">Course Builder</TabsTrigger>
                <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
                <TabsTrigger value="dashboard">My Learning</TabsTrigger>
              </TabsList>
              <TabsContent value="builder" className="mt-6">
                <CourseBuilder />
              </TabsContent>
              <TabsContent value="catalog" className="mt-6">
                <CourseCatalog />
              </TabsContent>
              <TabsContent value="dashboard" className="mt-6">
                <CourseDashboard />
              </TabsContent>
            </Tabs>
          </div>
        );
      case 'hr':
        console.log('⏰ Rendering TimeTracking');
        return <TimeTracking />;
      case 'integrations':
        console.log('🔌 Rendering IntegrationsSection');
        return <IntegrationsSection />;
      case 'marketplace':
        console.log('🛒 Rendering IntegrationMarketplace');
        return <IntegrationMarketplace />;
      case 'team':
        console.log('👥 Rendering TeamManagement');
        return <TeamManagement />;
      case 'settings':
        console.log('⚙️ Rendering Settings');
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="p-6 bg-gradient-card rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{profile?.full_name || 'User'}</h3>
                    <p className="text-muted-foreground">{profile?.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">{profile?.role || 'employee'}</p>
                  </div>
                  <div className="flex gap-2">
                    <ThemeToggle />
                    <Button variant="outline" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex">
      {!hideSidebar && <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />}
      <main className={`flex-1 ${activeSection === 'chat' || activeSection === 'email' ? '' : 'overflow-y-auto'}`}>
        {/* Enhanced Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-foreground capitalize">
                {activeSection === 'hr' ? 'Time Tracking' : activeSection}
              </h2>
              {activeSection === 'dashboard' && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Live
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGlobalSearchOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘K
                </kbd>
              </Button>
              <NotificationCenter />
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <div className={activeSection === 'chat' || activeSection === 'email' ? 'h-[calc(100vh-3.5rem)] flex flex-col' : 'p-6'}>
          {renderSection()}
        </div>
      </main>
      
      <CommandPalette 
        open={commandOpen} 
        setOpen={setCommandOpen} 
        onNavigate={setActiveSection}
      />
      
      <GlobalSearch 
        open={globalSearchOpen} 
        setOpen={setGlobalSearchOpen} 
        onNavigate={setActiveSection}
      />
      
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
