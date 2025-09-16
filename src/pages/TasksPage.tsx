import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks, useDeleteTask, useTeamMembers, Task, TaskFilters } from '@/hooks/useTasks';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { 
  Plus, 
  List, 
  Columns, 
  Folder,
  Trash2,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

// Import view components
import { TaskListView } from '@/components/tasks/views/TaskListView';
import { TaskBoardView } from '@/components/tasks/views/TaskBoardView';
import { ProjectTemplateModal } from '@/components/tasks/ProjectTemplateModal';
import { QuickTaskForm } from '@/components/tasks/QuickTaskForm';

type ViewType = 'list' | 'board';

export default function TasksPage() {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('board');
  const [compactMode, setCompactMode] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showQuickTask, setShowQuickTask] = useState(false);
  const [deleteTaskDialog, setDeleteTaskDialog] = useState<{ open: boolean; taskId: string | null }>({ open: false, taskId: null });
  const [deleteProjectDialog, setDeleteProjectDialog] = useState<{ open: boolean; projectId: string | null }>({ open: false, projectId: null });
  
  // Data hooks
  const { data: projects = [] } = useProjects();
  const { data: teamMembers = [] } = useTeamMembers();
  const taskFilters: TaskFilters = {
    project_id: selectedProject || undefined
  };
  
  const { data: tasks = [] } = useTasks(taskFilters);
  const deleteTaskMutation = useDeleteTask();
  const deleteProjectMutation = useDeleteProject();
  
  // Handle project deletion - reset selectedProject if it was deleted
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const projectExists = projects.find(p => p.id === selectedProject);
      if (!projectExists) {
        setSelectedProject(null);
      }
    }
  }, [selectedProject, projects]);
  
  // Delete handlers
  const handleDeleteTask = (taskId: string) => {
    setDeleteTaskDialog({ open: true, taskId });
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteProjectDialog({ open: true, projectId });
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskDialog.taskId) return;
    
    try {
      await deleteTaskMutation.mutateAsync(deleteTaskDialog.taskId);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const confirmDeleteProject = async () => {
    if (!deleteProjectDialog.projectId) return;
    
    const projectIdToDelete = deleteProjectDialog.projectId;
    const wasSelectedProject = selectedProject === projectIdToDelete;
    
    try {
      await deleteProjectMutation.mutateAsync(projectIdToDelete);
      
      // Reset selected project if it was the one being deleted
      if (wasSelectedProject) {
          setSelectedProject(null);
      }
      
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
    }
  };

  const viewIcons = {
    list: List,
    board: Columns
  };

  const renderCurrentView = () => {
    const commonProps = {
      tasks,
      compactMode,
      filters: {},
      onTaskUpdate: () => {}, // Will implement optimistic updates
      selectedProject,
      onDeleteTask: handleDeleteTask
    };

    switch (currentView) {
      case 'list':
        return <TaskListView {...commonProps} />;
      case 'board':
        return <TaskBoardView {...commonProps} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Common Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground capitalize">
              Tasks
            </h2>
            {selectedProject && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {projects.find(p => p.id === selectedProject)?.name || 'Project'}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {tasks.length} tasks
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
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

      {/* Tasks Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">
                {selectedProject 
                  ? projects.find(p => p.id === selectedProject)?.name || 'Project'
                  : 'All Tasks'
                }
              </h1>
            </div>
        </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              {Object.entries(viewIcons).map(([view, Icon]) => (
                <Button
                  key={view}
                  variant={currentView === view ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView(view as ViewType)}
                  className="h-8 px-3"
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>


            {/* Add Task */}
            <Button onClick={() => setShowQuickTask(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
                 </Button>
              </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Projects Sidebar */}
        <div className="w-72 bg-surface/50 border-r border-border/50 flex flex-col">
          <div className="p-4 space-y-4 overflow-auto">
            {/* Quick Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  console.log('Opening project modal');
                  setShowProjectModal(true);
                }}
                className="w-full"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Project
              </Button>
            </div>

            {/* Projects */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Projects</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProjectModal(true)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedProject(null)}
                  className={cn(
                    'w-full text-left p-2 rounded-md text-sm transition-colors',
                    !selectedProject 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'hover:bg-accent'
                  )}
                >
                  All Projects
                </button>
                
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center group">
                    <button
                    onClick={() => setSelectedProject(project.id)}
                      className={cn(
                        'flex-1 text-left p-2 rounded-md text-sm transition-colors',
                        selectedProject === project.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-accent'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4" />
                        <span className="truncate">{project.name}</span>
                      </div>
                    </button>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </div>
      </div>

      {/* Modals */}
      <QuickTaskForm 
        open={showQuickTask}
        onOpenChange={setShowQuickTask}
        projectId={selectedProject}
      />

      <ProjectTemplateModal 
        open={showProjectModal}
        onOpenChange={setShowProjectModal}
      />
      
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={deleteTaskDialog.open}
        onOpenChange={(open) => setDeleteTaskDialog({ open, taskId: null })}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteTask}
      />

      <ConfirmationDialog
        open={deleteProjectDialog.open}
        onOpenChange={(open) => setDeleteProjectDialog({ open, projectId: null })}
        title="Delete Project"
        description="Are you sure you want to delete this project? All tasks in this project will also be deleted. This action cannot be undone."
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteProject}
      />
    </div>
  );
}