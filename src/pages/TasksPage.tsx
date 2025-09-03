import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks, useCreateTask, useTeamMembers, Task, TaskFilters } from '@/hooks/useTasks';
import { useProjects, useCreateProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  List, 
  Columns, 
  Calendar, 
  BarChart3,
  Folder,
  User,
  Tag,
  Star,
  Menu,
  Settings,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Import view components
import { TaskListView } from '@/components/tasks/views/TaskListView';
import { TaskBoardView } from '@/components/tasks/views/TaskBoardView';
import { TaskCalendarView } from '@/components/tasks/views/TaskCalendarView';
import { TaskTimelineView } from '@/components/tasks/views/TaskTimelineView';
import { ProjectTemplateModal } from '@/components/tasks/ProjectTemplateModal';
import { QuickTaskForm } from '@/components/tasks/QuickTaskForm';

type ViewType = 'list' | 'board' | 'calendar' | 'timeline';

export default function TasksPage() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [compactMode, setCompactMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [savedViews, setSavedViews] = useState<any[]>([]);
  
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Data hooks
  const { data: projects = [] } = useProjects();
  const { data: teamMembers = [] } = useTeamMembers();
  const taskFilters: TaskFilters = {
    ...filters,
    project_id: selectedProject || undefined
  };
  const { data: tasks = [] } = useTasks(taskFilters);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          setShowQuickTask(true);
          break;
        case '/':
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case 'escape':
          setFilters({});
          setSelectedProject(null);
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, []);

  const viewIcons = {
    list: List,
    board: Columns,
    calendar: Calendar,
    timeline: BarChart3
  };

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800', 
    high: 'bg-red-100 text-red-800'
  };

  const statusOptions = [
    { value: 'not_started', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'Doing', color: 'bg-blue-100 text-blue-800' },
    { value: 'done', label: 'Done', color: 'bg-green-100 text-green-800' }
  ];

  const renderCurrentView = () => {
    const commonProps = {
      tasks,
      compactMode,
      filters,
      onTaskUpdate: () => {}, // Will implement optimistic updates
      selectedProject
    };

    switch (currentView) {
      case 'list':
        return <TaskListView {...commonProps} />;
      case 'board':
        return <TaskBoardView {...commonProps} />;
      case 'calendar':
        return <TaskCalendarView {...commonProps} />;
      case 'timeline':
        return <TaskTimelineView {...commonProps} />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className={cn(
        "border-r bg-card/50 backdrop-blur-sm transition-all duration-300",
        sidebarOpen ? "w-64" : "w-12"
      )}>
        <div className="p-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-start"
          >
            <Menu className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Tasks</span>}
          </Button>
        </div>

        {sidebarOpen && (
          <div className="p-3 space-y-4">
            {/* Quick Views */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Quick Views
              </h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => {
                    setSelectedProject(null);
                    setFilters({ assignee: profile?.id });
                  }}
                >
                  <User className="h-3 w-3 mr-2" />
                  My Tasks
                  <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                    {tasks.filter(t => t.assigned_to === profile?.id).length}
                  </Badge>
                </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   className="w-full justify-start h-8 text-xs"
                   onClick={() => {
                     setFilters({});
                   }}
                 >
                   <Calendar className="h-3 w-3 mr-2" />
                   Due Today
                   <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                     {tasks.filter(t => {
                       if (!t.due_date) return false;
                       const today = new Date().toDateString();
                       return new Date(t.due_date).toDateString() === today;
                     }).length}
                   </Badge>
                 </Button>
              </div>
            </div>

            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Projects
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowProjectModal(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                <Button
                  variant={!selectedProject ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => setSelectedProject(null)}
                >
                  <Folder className="h-3 w-3 mr-2" />
                  All Projects
                  <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                    {tasks.length}
                  </Badge>
                </Button>
                {projects.map(project => (
                  <Button
                    key={project.id}
                    variant={selectedProject === project.id ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <Folder className="h-3 w-3 mr-2" />
                    {project.name}
                    <Badge variant="secondary" className="ml-auto h-5 px-2 text-xs">
                      {tasks.filter(t => t.project_id === project.id).length}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Saved Views */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Saved Views
              </h3>
              <div className="space-y-1">
                {savedViews.map(view => (
                  <Button
                    key={view.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                  >
                    <Star className="h-3 w-3 mr-2" />
                    {view.name}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-xs text-muted-foreground"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Save current view
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b bg-background/95 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                size="sm"
                className="h-8 bg-gradient-brand hover:opacity-90"
                onClick={() => setShowQuickTask(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                New Task
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setShowProjectModal(true)}
              >
                <Folder className="h-3 w-3 mr-1" />
                New Project
              </Button>

              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Search tasks... (Press / to focus)"
                  className="h-8 w-64 pl-7 text-xs"
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-3 w-3 mr-1" />
                    Filters
                    {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof TaskFilters]).length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1">
                        {Object.keys(filters).filter(k => k !== 'search' && filters[k as keyof TaskFilters]).length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Filters</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium">Status</label>
                        <Select
                          value={filters.status?.[0] || ''}
                          onValueChange={(value) => setFilters({ ...filters, status: value ? [value] : undefined })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Any status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                       <div>
                         <label className="text-xs font-medium">Assignee</label>
                         <Select
                           value={filters.assignee || ''}
                           onValueChange={(value) => setFilters({ ...filters, assignee: value || undefined })}
                         >
                           <SelectTrigger className="h-8">
                             <SelectValue placeholder="Anyone" />
                           </SelectTrigger>
                           <SelectContent>
                             {teamMembers.map(member => (
                               <SelectItem key={member.id} value={member.id}>
                                 {member.full_name || member.email}
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setFilters({})}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-2">
              {/* View Switcher */}
              <div className="flex items-center border rounded-lg p-1">
                {(Object.keys(viewIcons) as ViewType[]).map(view => {
                  const Icon = viewIcons[view];
                  return (
                    <Button
                      key={view}
                      variant={currentView === view ? "secondary" : "ghost"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setCurrentView(view)}
                    >
                      <Icon className="h-3 w-3" />
                    </Button>
                  );
                })}
              </div>

              <Button
                variant={compactMode ? "secondary" : "outline"}
                size="sm"
                className="h-8"
                onClick={() => setCompactMode(!compactMode)}
              >
                Compact
              </Button>

              <Button variant="outline" size="sm" className="h-8">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {renderCurrentView()}
        </div>
      </div>

      {/* Modals */}
      <ProjectTemplateModal 
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
      />
      
      <QuickTaskForm
        open={showQuickTask}
        onOpenChange={setShowQuickTask}
        initialStatus="not_started"
        projectId={selectedProject}
      />
    </div>
  );
}