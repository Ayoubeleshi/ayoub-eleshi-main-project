import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from './ProgressBar';
import { SubtaskForm } from './SubtaskForm';
import { 
  useSubtasks, 
  useUpdateSubtask, 
  useDeleteSubtask, 
  useReorderSubtasks,
  calculateProgress 
} from '@/hooks/useSubtasks';
import { useTeamMembers } from '@/hooks/useTasks';
import { 
  CalendarIcon, 
  UserIcon, 
  Edit2, 
  Trash2, 
  Plus,
  GripVertical,
  CheckCircle2,
  Circle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SubtaskListProps {
  taskId: string;
}

interface SortableSubtaskItemProps {
  subtask: any;
  index: number;
  onEdit: (subtask: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'not_started' | 'in_progress' | 'done') => void;
  editingSubtask: string | null;
  editTitle: string;
  editDescription: string;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  getAssigneeName: (assignedTo: string | null) => string | null;
}

function SortableSubtaskItem({
  subtask,
  index,
  onEdit,
  onDelete,
  onStatusChange,
  editingSubtask,
  editTitle,
  editDescription,
  onEditTitleChange,
  onEditDescriptionChange,
  onSaveEdit,
  onCancelEdit,
  getAssigneeName,
}: SortableSubtaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subtask.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all',
        isDragging && 'shadow-lg rotate-2'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Status Checkbox */}
          <Checkbox
            checked={subtask.status === 'done'}
            onCheckedChange={(checked) => {
              onStatusChange(
                subtask.id,
                checked ? 'done' : 'not_started'
              );
            }}
            className="mt-1"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            {editingSubtask === subtask.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => onEditTitleChange(e.target.value)}
                  className="w-full p-2 border rounded text-sm font-medium"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => onEditDescriptionChange(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  rows={2}
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSaveEdit(subtask.id)}
                    disabled={!editTitle.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(subtask.status)}
                  <h4 className={cn(
                    'font-medium text-sm',
                    subtask.status === 'done' && 'line-through text-muted-foreground'
                  )}>
                    {subtask.title}
                  </h4>
                </div>

                {subtask.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {subtask.description}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getStatusColor(subtask.status))}
                  >
                    {subtask.status === 'not_started' ? 'Not Started' :
                     subtask.status === 'in_progress' ? 'In Progress' : 'Done'}
                  </Badge>

                  {subtask.assigned_to && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UserIcon className="w-3 h-3" />
                      {getAssigneeName(subtask.assigned_to)}
                    </div>
                  )}

                  {subtask.due_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="w-3 h-3" />
                      {format(new Date(subtask.due_date), 'MMM d')}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {editingSubtask !== subtask.id && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(subtask)}
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(subtask.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SubtaskList({ taskId }: SubtaskListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data: subtasks = [], isLoading } = useSubtasks(taskId);
  const updateSubtaskMutation = useUpdateSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const reorderSubtasksMutation = useReorderSubtasks();
  const { data: teamMembers = [] } = useTeamMembers();

  const progress = calculateProgress(subtasks);

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return null;
    const member = teamMembers.find(m => m.id === assignedTo);
    return member?.full_name || member?.email || 'Unknown';
  };

  const handleStatusChange = async (subtaskId: string, newStatus: 'not_started' | 'in_progress' | 'done') => {
    await updateSubtaskMutation.mutateAsync({
      id: subtaskId,
      status: newStatus,
    });
  };

  const handleDelete = async (subtaskId: string) => {
    if (confirm('Are you sure you want to delete this subtask?')) {
      await deleteSubtaskMutation.mutateAsync(subtaskId);
    }
  };

  const handleEdit = (subtask: any) => {
    setEditingSubtask(subtask.id);
    setEditTitle(subtask.title);
    setEditDescription(subtask.description || '');
  };

  const handleSaveEdit = async (subtaskId: string) => {
    await updateSubtaskMutation.mutateAsync({
      id: subtaskId,
      title: editTitle,
      description: editDescription,
    });
    setEditingSubtask(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleCancelEdit = () => {
    setEditingSubtask(null);
    setEditTitle('');
    setEditDescription('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subtasks.findIndex(item => item.id === active.id);
      const newIndex = subtasks.findIndex(item => item.id === over.id);

      const newSubtasks = arrayMove(subtasks, oldIndex, newIndex);
      const subtaskIds = newSubtasks.map(subtask => subtask.id);
      
      await reorderSubtasksMutation.mutateAsync({
        taskId,
        subtaskIds,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-2 bg-muted rounded w-full"></div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <ProgressBar progress={progress} />

      {/* Add Subtask Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowForm(true)}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Subtask
      </Button>

      {/* Subtask Form */}
      {showForm && (
        <Card>
          <CardContent className="p-4">
            <SubtaskForm
              taskId={taskId}
              onSuccess={() => setShowForm(false)}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Subtasks List */}
      {subtasks.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={subtasks.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {subtasks.map((subtask, index) => (
                <SortableSubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  editingSubtask={editingSubtask}
                  editTitle={editTitle}
                  editDescription={editDescription}
                  onEditTitleChange={setEditTitle}
                  onEditDescriptionChange={setEditDescription}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  getAssigneeName={getAssigneeName}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No subtasks yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}
