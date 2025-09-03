import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  Search, 
  Home, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Files, 
  GraduationCap, 
  Clock, 
  Settings,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onNavigate: (section: string) => void;
}

export function CommandPalette({ open, setOpen, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'View team overview and stats' },
    { id: 'chat', label: 'Chat', icon: MessageSquare, description: 'Team communication and channels' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, description: 'Manage tasks and projects' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Schedule meetings and events' },
    { id: 'files', label: 'Files', icon: Files, description: 'File management and sharing' },
    { id: 'courses', label: 'Courses', icon: GraduationCap, description: 'Learning and development' },
    { id: 'hr', label: 'Time Tracking', icon: Clock, description: 'Track time and attendance' },
    { id: 'team', label: 'Team Management', icon: Users, description: 'Manage team members and roles' },
    { id: 'integrations', label: 'Integrations', icon: Zap, description: 'Connect external tools' },
    { id: 'marketplace', label: 'Integration Marketplace', icon: Zap, description: 'Browse available integrations' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account and preferences' },
  ];

  const quickActions = [
    { id: 'new-task', label: 'Create New Task', icon: CheckSquare, description: 'Add a new task to your board' },
    { id: 'new-meeting', label: 'Schedule Meeting', icon: Calendar, description: 'Schedule a new meeting' },
    { id: 'invite-user', label: 'Invite Team Member', icon: Users, description: 'Send an invitation to join your team' },
    { id: 'view-analytics', label: 'View Analytics', icon: BarChart3, description: 'See team performance metrics' },
    { id: 'create-automation', label: 'Create Automation', icon: Zap, description: 'Set up workflow automation' },
  ];

  const handleSelect = (value: string) => {
    setOpen(false);
    setSearch('');
    
    // Handle navigation
    if (navigation.find(item => item.id === value)) {
      onNavigate(value);
      return;
    }
    
    // Handle quick actions
    switch (value) {
      case 'new-task':
        // TODO: Open new task dialog
        onNavigate('tasks');
        break;
      case 'new-meeting':
        // TODO: Open new meeting dialog
        onNavigate('calendar');
        break;
      case 'invite-user':
        // TODO: Open invite user dialog
        onNavigate('settings');
        break;
      case 'view-analytics':
        onNavigate('dashboard');
        break;
      case 'create-automation':
        onNavigate('integrations');
        break;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigation
            .filter(item => 
              item.label.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              );
            })}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Quick Actions">
          {quickActions
            .filter(item => 
              item.label.toLowerCase().includes(search.toLowerCase()) ||
              item.description.toLowerCase().includes(search.toLowerCase())
            )
            .map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              );
            })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}