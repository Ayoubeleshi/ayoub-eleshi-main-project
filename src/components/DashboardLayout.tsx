import { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active section based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/tasks/boards')) {
      setActiveSection('tasks');
    } else if (path === '/dashboard') {
      setActiveSection('dashboard');
    } else if (path.startsWith('/chat')) {
      setActiveSection('chat');
    } else if (path.startsWith('/email')) {
      setActiveSection('email');
    } else if (path.startsWith('/calendar')) {
      setActiveSection('calendar');
    } else if (path.startsWith('/files')) {
      setActiveSection('files');
    } else if (path.startsWith('/courses')) {
      setActiveSection('courses');
    } else if (path.startsWith('/hr')) {
      setActiveSection('hr');
    } else if (path.startsWith('/team')) {
      setActiveSection('team');
    } else if (path.startsWith('/integrations')) {
      setActiveSection('integrations');
    } else if (path.startsWith('/marketplace')) {
      setActiveSection('marketplace');
    } else if (path.startsWith('/settings')) {
      setActiveSection('settings');
    }
  }, [location.pathname]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Navigate to appropriate route
    if (section === 'dashboard') {
      navigate('/dashboard');
    } else if (section === 'chat') {
      navigate('/chat');
    } else if (section === 'email') {
      navigate('/email');
    } else if (section === 'tasks') {
      navigate('/tasks/boards');
    } else if (section === 'calendar') {
      navigate('/calendar');
    } else if (section === 'files') {
      navigate('/files');
    } else if (section === 'courses') {
      navigate('/courses');
    } else if (section === 'hr') {
      navigate('/hr');
    } else if (section === 'team') {
      navigate('/team');
    } else if (section === 'integrations') {
      navigate('/integrations');
    } else if (section === 'marketplace') {
      navigate('/marketplace');
    } else if (section === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-surface/30 to-background">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
