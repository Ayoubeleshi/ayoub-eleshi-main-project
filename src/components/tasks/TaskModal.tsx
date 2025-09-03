import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, User, Tag, Clock, MessageSquare, Paperclip, CheckSquare, X } from 'lucide-react';
import { Task, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TaskModalProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskModal({ task, open, onOpenChange }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'not_started');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to || '');
  const [dueDate, setDueDate] = useState(task?.due_date || '');

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: teamMembers = [] } = useTeamMembers();

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  const handleSave = async () => {
    if (!task) return;
    
    await updateTaskMutation.mutateAsync({
      id: task.id,
      title,
      description,
      status,
      priority,
      assigned_to: assignedTo || undefined,
      due_date: dueDate || undefined,
    });
    
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    await deleteTaskMutation.mutateAsync(task.id);
    onOpenChange(false);
  };

  if (!task) return null;

  const statusColors = {
    not_started: 'bg-muted text-muted-foreground',
    in_progress: 'bg-primary/10 text-primary',
    done: 'bg-success/10 text-success'
  };

  const priorityColors = {
    low: 'bg-success/10 text-success',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-destructive/10 text-destructive'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-surface">
          <div className="flex-1 pr-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none bg-transparent p-0 focus:ring-0 focus:border-none"
              placeholder="Task title..."
            />
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn("text-xs", statusColors[status])}>
                {status === 'not_started' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Done'}
              </Badge>
              <Badge className={cn("text-xs", priorityColors[priority])}>
                {priority} priority
              </Badge>
              {task.due_date && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue placeholder="Assign to...">
                  {assignedTo && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage 
                          src={teamMembers.find(m => m.id === assignedTo)?.avatar_url} 
                          alt="Assignee" 
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(
                            teamMembers.find(m => m.id === assignedTo)?.full_name,
                            teamMembers.find(m => m.id === assignedTo)?.email
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {teamMembers.find(m => m.id === assignedTo)?.full_name || 
                         teamMembers.find(m => m.id === assignedTo)?.email}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Unassigned</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={member.avatar_url} alt={member.full_name || member.email} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.full_name, member.email)}
                        </AvatarFallback>
                      </Avatar>
                      {member.full_name || member.email}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={status} onValueChange={(value) => setStatus(value as 'not_started' | 'in_progress' | 'done')}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="description" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4 grid w-full grid-cols-4">
              <TabsTrigger value="description" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Description
              </TabsTrigger>
              <TabsTrigger value="subtasks" className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Subtasks
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 px-6 pb-6 overflow-auto">
              <TabsContent value="description" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="mt-2 min-h-[120px] resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Due Date</label>
                    <Input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <Input
                      placeholder="Add tags..."
                      className="mt-2"
                      disabled
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="subtasks" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Subtasks coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Paperclip className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Attachments coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Comments coming soon</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-surface/50">
          <div className="text-xs text-muted-foreground">
            Created {format(new Date(task.created_at), 'MMM d, yyyy')} • 
            Updated {format(new Date(task.updated_at), 'MMM d, yyyy')}
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={deleteTaskMutation.isPending}
            >
              Delete
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
              disabled={updateTaskMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}