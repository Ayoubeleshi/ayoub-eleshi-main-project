import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateSubtask } from '@/hooks/useSubtasks';
import { useTeamMembers } from '@/hooks/useTasks';
import { createSubtaskSchema, CreateSubtaskData } from '@/lib/validations/subtask';

interface SubtaskFormProps {
  taskId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<CreateSubtaskData>;
}

export function SubtaskForm({ taskId, onSuccess, onCancel, initialData }: SubtaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'done'>(initialData?.status || 'not_started');
  const [assignedTo, setAssignedTo] = useState(initialData?.assigned_to || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.due_date ? new Date(initialData.due_date) : undefined
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createSubtaskMutation = useCreateSubtask();
  const { data: teamMembers = [] } = useTeamMembers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const formData: CreateSubtaskData = {
        task_id: taskId,
        title,
        description: description || undefined,
        status,
        assigned_to: assignedTo || undefined,
        due_date: dueDate?.toISOString(),
        order_index: 0, // Will be set by the backend
      };

      // Validate with Zod
      const validatedData = createSubtaskSchema.parse(formData);
      
      await createSubtaskMutation.mutateAsync(validatedData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setStatus('not_started');
      setAssignedTo('');
      setDueDate(undefined);
      
      onSuccess?.();
    } catch (error: any) {
      if (error.issues) {
        // Zod validation errors
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setStatus('not_started');
    setAssignedTo('');
    setDueDate(undefined);
    setErrors({});
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter subtask title..."
          className={cn(errors.title && 'border-red-500')}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter subtask description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: any) => setStatus(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignee..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !dueDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={createSubtaskMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createSubtaskMutation.isPending || !title.trim()}
        >
          {createSubtaskMutation.isPending ? (
            <>Creating...</>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Create Subtask
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
