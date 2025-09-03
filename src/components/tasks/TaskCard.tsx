import { format } from 'date-fns';
import { Calendar, MoreVertical, User } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityColors = {
  low: 'border-l-success/50',
  medium: 'border-l-warning/50', 
  high: 'border-l-destructive/50',
};

const priorityBadgeColors = {
  low: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityIcons = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

export function TaskCard({ task, onClick, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-grab active:cursor-grabbing",
        "hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]",
        "bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-sm border-0",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-background/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300",
        "hover:before:opacity-100",
        priorityColors[task.priority || 'medium'],
        isDragging && "opacity-60 rotate-2 scale-105 shadow-2xl z-50"
      )}
      onClick={onClick}
    >
      {/* Priority indicator line */}
      <div className={cn(
        "absolute left-0 top-0 w-1 h-full transition-all duration-300",
        task.priority === 'low' && "bg-gradient-to-b from-success to-success/70",
        task.priority === 'medium' && "bg-gradient-to-b from-warning to-warning/70",
        task.priority === 'high' && "bg-gradient-to-b from-destructive to-destructive/70"
      )}></div>

      <div className="p-4 space-y-3 relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-2">
            <h4 className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {task.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="cursor-pointer"
              >
                ✏️ Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-destructive cursor-pointer"
              >
                🗑️ Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority and metadata */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs font-medium px-2 py-1 transition-colors",
              priorityBadgeColors[task.priority || 'medium']
            )}
          >
            {priorityIcons[task.priority || 'medium']} {task.priority || 'medium'}
          </Badge>

          {/* Due date */}
          {task.due_date && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
        </div>

        {/* Assignee */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center space-x-2">
            {task.assignee ? (
              <>
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assignee.avatar_url} alt={task.assignee.full_name || task.assignee.email} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(task.assignee.full_name, task.assignee.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {task.assignee.full_name || task.assignee.email}
                </span>
              </>
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-xs">Unassigned</span>
              </div>
            )}
          </div>

          {/* Status indicator */}
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            task.status === 'not_started' && "bg-muted-foreground/50",
            task.status === 'in_progress' && "bg-primary animate-pulse",
            task.status === 'done' && "bg-success"
          )}></div>
        </div>
      </div>
    </Card>
  );
}