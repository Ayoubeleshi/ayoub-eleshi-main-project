import { Task } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, Calendar, User, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskListViewProps {
  tasks: Task[];
  compactMode: boolean;
  filters: any;
  onTaskUpdate: () => void;
  selectedProject: string | null;
  onDeleteTask?: (taskId: string) => void;
}

const statusColors = {
  not_started: 'bg-slate-100 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  done: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
};

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
};

const priorityDotColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

const getInitials = (name?: string, email?: string) => {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
  if (email) return email.substring(0, 2).toUpperCase();
  return '??';
};

export function TaskListView({ tasks, compactMode, onDeleteTask }: TaskListViewProps) {
  return (
    <div className="h-full bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto p-4 h-full overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4 opacity-30">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">No tasks found</h3>
            <p className="text-muted-foreground">Create your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={cn(
                  'group relative bg-card border border-border rounded-xl p-4',
                  'hover:shadow-lg transition-shadow duration-200',
                  'shadow-sm',
                  compactMode && 'p-3'
                )}
              >
                {/* Priority indicator line */}
                <div className={cn(
                  'absolute left-0 top-0 bottom-0 w-1 rounded-l-xl',
                  priorityDotColors[task.priority || 'medium']
                )} />

                <div className="flex items-center gap-4">
                  {/* Task content */}
                  <div className="flex-1 min-w-0">
                    {/* Main row: Title and Status */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={cn(
                        'font-semibold text-foreground leading-tight truncate',
                        compactMode ? 'text-base' : 'text-lg'
                      )}>
                        {task.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status badge */}
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full',
                            statusColors[task.status]
                          )}
                        >
                          {task.status === 'not_started' ? 'To Do' :
                           task.status === 'in_progress' ? 'In Progress' : 'Done'}
                        </Badge>
                        
                        {/* Priority badge - only show for high priority */}
                        {task.priority === 'high' && (
                          <Badge 
                            variant="outline" 
                            className="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800"
                          >
                            🔥 High
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-muted-foreground text-sm mb-2 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Bottom row: Metadata and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {/* Due date */}
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                          </div>
                        )}

                        {/* Created date */}
                        <div className="flex items-center gap-1">
                          <span>Created {format(new Date(task.created_at), 'MMM d')}</span>
                        </div>

                        {/* Project info if available */}
                        {task.project_id && (
                          <div className="flex items-center gap-1">
                            <span>📁 Project</span>
                          </div>
                        )}
                      </div>

                      {/* Right side: Assignee and Actions */}
                      <div className="flex items-center gap-2">
                        {/* Assignee */}
                        {task.assignee ? (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-6 h-6 border border-border">
                              <AvatarImage
                                src={task.assignee.avatar_url}
                                alt={task.assignee.full_name || task.assignee.email}
                              />
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {getInitials(task.assignee.full_name, task.assignee.email)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              {task.assignee.full_name || task.assignee.email}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 opacity-60">
                            <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center border border-border">
                              <User className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground hidden sm:block">
                              Unassigned
                            </span>
                          </div>
                        )}

                        {/* Delete button */}
                        {onDeleteTask && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteTask(task.id)}
                            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}