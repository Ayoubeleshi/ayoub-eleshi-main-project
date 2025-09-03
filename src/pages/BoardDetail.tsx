import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Plus, Layout, List, CalendarIcon } from 'lucide-react';
import { useProject } from '@/hooks/useProjects';
import { TaskKanbanBoard } from '@/components/tasks/TaskKanbanBoard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TaskFiltersType {
  search?: string;
  status?: string[];
  assignee?: string;
}

type BoardView = 'kanban' | 'list' | 'calendar';

export default function BoardDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TaskFiltersType>({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<BoardView>('kanban');
  
  const { data: project, isLoading, error } = useProject(projectId!);

  console.log('BoardDetail render:', { projectId, project, isLoading, error });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="flex-1">
                <div className="h-8 bg-muted rounded-lg w-64 mb-2"></div>
                <div className="h-5 bg-muted/60 rounded w-96"></div>
              </div>
              <div className="w-24 h-6 bg-muted rounded-full"></div>
            </div>
            
            {/* Board skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-surface/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 rounded-full blur-3xl"></div>
              <div className="relative w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                <ArrowLeft className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Board not found</h3>
            <p className="text-muted-foreground mb-8">
              The board you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/tasks/boards')} size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Boards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/tasks/boards')}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="text-lg text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={project.status === 'active' ? 'default' : 'secondary'}
                  className={cn(
                    "px-3 py-1 text-sm",
                    project.status === 'active' && 'bg-success/10 text-success border-success/20'
                  )}
                >
                  {project.status}
                </Badge>
                
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="hover:bg-primary/5 hover:border-primary/30"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                
                {/* View Switcher */}
                <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
                  <Button
                    variant={currentView === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('kanban')}
                    className="h-8 px-3"
                  >
                    <Layout className="w-4 h-4 mr-2" />
                    Kanban
                  </Button>
                  <Button
                    variant={currentView === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('list')}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4 mr-2" />
                    List
                  </Button>
                  <Button
                    variant={currentView === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('calendar')}
                    className="h-8 px-3"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Calendar
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <Card className="p-6 bg-gradient-card backdrop-blur-sm border-0 animate-fade-in">
                <TaskFilters 
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </Card>
            )}
          </div>

          {/* Main Content - View Based */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            {currentView === 'kanban' && (
              <TaskKanbanBoard 
                filters={filters} 
                projectId={projectId}
              />
            )}
            
            {currentView === 'list' && (
              <div className="space-y-4">
                <div className="bg-card rounded-lg border shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Tasks List</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {project.tasks?.length || 0} tasks
                        </span>
                      </div>
                    </div>
                    
                    {/* Tasks Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-3 font-medium text-muted-foreground">Task</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Priority</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Assignee</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.tasks && project.tasks.length > 0 ? (
                            project.tasks.map((task: any) => (
                              <tr key={task.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <div className="font-medium">{task.title}</div>
                                    {task.description && (
                                      <div className="text-sm text-muted-foreground line-clamp-2">
                                        {task.description}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge 
                                    variant={task.status === 'done' ? 'default' : 'secondary'}
                                    className={cn(
                                      "px-2 py-1 text-xs",
                                      task.status === 'done' && 'bg-success/10 text-success border-success/20',
                                      task.status === 'in_progress' && 'bg-warning/10 text-warning border-warning/20',
                                      task.status === 'not_started' && 'bg-muted text-muted-foreground'
                                    )}
                                  >
                                    {task.status === 'not_started' ? 'Not Started' : 
                                     task.status === 'in_progress' ? 'In Progress' : 
                                     task.status === 'done' ? 'Done' : task.status}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <Badge 
                                    variant="outline"
                                    className={cn(
                                      "px-2 py-1 text-xs",
                                      task.priority === 'high' && 'border-destructive/50 text-destructive',
                                      task.priority === 'medium' && 'border-warning/50 text-warning',
                                      task.priority === 'low' && 'border-success/50 text-success'
                                    )}
                                  >
                                    {task.priority === 'high' ? '🔥 High' : 
                                     task.priority === 'medium' ? '⚡ Medium' : 
                                     task.priority === 'low' ? '✅ Low' : task.priority}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center space-x-2">
                                    {task.assigned_to ? (
                                      <>
                                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                          <span className="text-xs font-medium text-primary">
                                            {task.assigned_to?.full_name?.charAt(0) || task.assigned_to?.email?.charAt(0) || '?'}
                                          </span>
                                        </div>
                                        <span className="text-sm">
                                          {task.assigned_to?.full_name || task.assigned_to?.email || 'Unknown'}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-sm text-muted-foreground">Unassigned</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  {task.due_date ? (
                                    <span className="text-sm">
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No due date</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(task.created_at).toLocaleDateString()}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center">
                                <div className="space-y-2">
                                  <List className="w-12 h-12 text-muted-foreground mx-auto" />
                                  <h3 className="text-lg font-semibold">No tasks yet</h3>
                                  <p className="text-muted-foreground">
                                    Create your first task to get started with this board.
                                  </p>
                                  <Button 
                                    onClick={() => {/* TODO: Open create task modal */}}
                                    className="mt-2"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Task
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentView === 'calendar' && (
              <div className="space-y-4">
                <div className="bg-card rounded-lg border shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Calendar View</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {project.tasks?.length || 0} tasks
                        </span>
                      </div>
                    </div>
                    
                    {/* Simple Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Calendar Headers */}
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - date.getDay() + i);
                        const dateString = date.toISOString().split('T')[0];
                        
                        // Find tasks for this date
                        const tasksForDate = project.tasks?.filter((task: any) => 
                          task.due_date && task.due_date.split('T')[0] === dateString
                        ) || [];
                        
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isCurrentMonth = date.getMonth() === new Date().getMonth();
                        
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "min-h-[80px] p-2 border border-border/50 relative",
                              isToday && "bg-primary/5 border-primary/30",
                              !isCurrentMonth && "bg-muted/20 text-muted-foreground"
                            )}
                          >
                            <div className={cn(
                              "text-sm font-medium mb-1",
                              isToday && "text-primary font-semibold"
                            )}>
                              {date.getDate()}
                            </div>
                            
                            {/* Tasks for this date */}
                            <div className="space-y-1">
                              {tasksForDate.map((task: any) => (
                                <div 
                                  key={task.id}
                                  className={cn(
                                    "text-xs p-1 rounded cursor-pointer hover:bg-muted/50 transition-colors",
                                    task.status === 'done' && 'bg-success/10 text-success',
                                    task.status === 'in_progress' && 'bg-warning/10 text-warning',
                                    task.status === 'not_started' && 'bg-muted text-muted-foreground'
                                  )}
                                  title={`${task.title} - ${task.status}`}
                                >
                                  <div className="truncate font-medium">{task.title}</div>
                                  <div className="text-xs opacity-75">
                                    {task.priority === 'high' ? '🔥' : 
                                     task.priority === 'medium' ? '⚡' : '✅'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Task Legend */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <h4 className="text-sm font-medium mb-2">Legend</h4>
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-success/10 rounded border border-success/20"></div>
                          <span>Done</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-warning/10 rounded border border-warning/20"></div>
                          <span>In Progress</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-muted rounded border border-border"></div>
                          <span>Not Started</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}