import { format } from 'date-fns';
import { Calendar, MessageSquare, Paperclip, User, CheckSquare } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TrelloTaskCardProps {
  task: Task;
  onClick: () => void;
  compact?: boolean;
}

const priorityColors = {
  low: 'bg-success/20 border-l-success',
  medium: 'bg-warning/20 border-l-warning',
  high: 'bg-destructive/20 border-l-destructive',
};

const statusColors = {
  not_started: 'bg-muted/50',
  in_progress: 'bg-primary/10',
  done: 'bg-success/10',
};

export function TrelloTaskCard({ task, onClick, compact = false }: TrelloTaskCardProps) {
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
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        "bg-card border-l-4 rounded-lg p-3 space-y-3",
        priorityColors[task.priority || 'medium'],
        isDragging && "opacity-60 rotate-1 scale-105 shadow-lg z-50"
      )}
      onClick={onClick}
    >
      {/* Labels/Tags */}
      <div className="flex items-center gap-1 flex-wrap">
        <Badge 
          variant="secondary" 
          className={cn("text-xs px-2 py-0.5 rounded-full", statusColors[task.status])}
        >
          {task.status === 'not_started' ? 'To Do' : 
           task.status === 'in_progress' ? 'In Progress' : 'Done'}
        </Badge>
        {task.priority === 'high' && (
          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive border-destructive/20">
            🔥 High
          </Badge>
        )}
      </div>

      {/* Title */}
      <h4 className={cn(
        "font-semibold text-card-foreground group-hover:text-primary transition-colors",
        compact ? "text-sm leading-tight" : "text-base leading-snug"
      )}>
        {task.title}
      </h4>

      {/* Description */}
      {task.description && !compact && (
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Footer with meta info */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          {/* Due date */}
          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
          
          {/* Activity indicators */}
          <div className="flex items-center gap-2">
            {/* Comments placeholder */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-50">
              <MessageSquare className="w-3 h-3" />
              <span>0</span>
            </div>
            
            {/* Attachments placeholder */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-50">
              <Paperclip className="w-3 h-3" />
              <span>0</span>
            </div>
            
            {/* Subtasks placeholder */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-50">
              <CheckSquare className="w-3 h-3" />
              <span>0</span>
            </div>
          </div>
        </div>

        {/* Assignee */}
        <div className="flex items-center">
          {task.assignee ? (
            <Avatar className="w-6 h-6 border-2 border-background shadow-sm">
              <AvatarImage 
                src={task.assignee.avatar_url} 
                alt={task.assignee.full_name || task.assignee.email} 
              />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(task.assignee.full_name, task.assignee.email)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
              <User className="w-3 h-3 text-muted-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg pointer-events-none" />
    </Card>
  );
}