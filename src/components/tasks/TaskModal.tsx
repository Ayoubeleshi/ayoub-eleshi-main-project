import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Task, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useTeamMembers } from '@/hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  // Use a non-empty sentinel for unassigned to satisfy Radix Select
  const UNASSIGNED = 'unassigned';
  const [assignedTo, setAssignedTo] = useState(task?.assigned_to ?? UNASSIGNED);
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  // Project edit support (match create form UX)
  const NONE_PROJECT = 'none';
  const [projectId, setProjectId] = useState<string>(task?.project_id ?? NONE_PROJECT);

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: projects = [] } = useProjects();
  
  console.log('TaskModal render - open:', open, 'task:', task?.id, task?.title);

  const handleSave = async () => {
    if (!task) return;
    
    await updateTaskMutation.mutateAsync({
      id: task.id,
      title,
      description,
      status,
      priority,
      assigned_to: assignedTo === UNASSIGNED ? null : assignedTo,
      project_id: projectId === NONE_PROJECT ? null : projectId,
      due_date: dueDate || undefined,
    });
    
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    await deleteTaskMutation.mutateAsync(task.id);
    onOpenChange(false);
  };

  // Sync state when opening or switching task
  useEffect(() => {
    if (!task) return;
    setTitle(task.title || '');
    setDescription(task.description || '');
    setStatus(task.status || 'not_started');
    setPriority(task.priority || 'medium');
    setAssignedTo(task.assigned_to ?? UNASSIGNED);
    setDueDate(task.due_date || '');
    setProjectId(task.project_id ?? NONE_PROJECT);
  }, [task?.id, open]);

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'not_started' | 'in_progress' | 'done')}>
                <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign to</label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {teamMembers.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name || m.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PROJECT}>No project</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
                  </div>
                </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Created {format(new Date(task.created_at), 'MMM d, yyyy')} • Updated {format(new Date(task.updated_at), 'MMM d, yyyy')}
            </span>
          </div>
          
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="destructive" onClick={handleDelete} disabled={deleteTaskMutation.isPending}>Delete</Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateTaskMutation.isPending}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}