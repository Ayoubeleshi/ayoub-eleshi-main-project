import { format } from 'date-fns';
import { Calendar, User, Flag, Clock, Edit, Trash2, X } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TaskDetailDrawerProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  done: 'Done',
};

const statusColors = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary',
  done: 'bg-success/10 text-success',
};

const priorityColors = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

export function TaskDetailDrawer({ task, open, onOpenChange, onEdit, onDelete }: TaskDetailDrawerProps) {
  if (!task) return null;

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DrawerTitle className="text-lg font-semibold">{task.title}</DrawerTitle>
              {task.description && (
                <DrawerDescription className="mt-2 text-sm text-muted-foreground">
                  {task.description}
                </DrawerDescription>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={onDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-6">
          {/* Status and Priority */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn("capitalize", statusColors[task.status])}>
              {statusLabels[task.status]}
            </Badge>
            <Badge className={cn("capitalize", priorityColors[task.priority || 'medium'])}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority || 'medium'} Priority
            </Badge>
          </div>

          <Separator />

          {/* Task Details */}
          <div className="space-y-4">
            {/* Due Date */}
            {task.due_date && (
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(task.due_date), 'PPP')}
                  </p>
                </div>
              </div>
            )}

            {/* Assignee */}
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Assignee:</p>
                {task.assignee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage 
                        src={task.assignee.avatar_url} 
                        alt={task.assignee.full_name || task.assignee.email} 
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(task.assignee.full_name, task.assignee.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">
                      {task.assignee.full_name || task.assignee.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Unassigned</span>
                )}
              </div>
            </div>

            {/* Creator */}
            {task.creator && (
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-sm text-muted-foreground">
                    {task.creator.full_name || task.creator.email}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(task.created_at), 'PPp')}
                </p>
                {task.updated_at !== task.created_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {format(new Date(task.updated_at), 'PPp')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}