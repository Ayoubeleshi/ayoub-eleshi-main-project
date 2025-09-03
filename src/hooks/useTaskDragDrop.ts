import { useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { Task, useUpdateTask } from './useTasks';
import { toast } from '@/hooks/use-toast';

export function useTaskDragDrop() {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const updateTaskMutation = useUpdateTask();

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !draggedTask) {
      setDraggedTask(null);
      return;
    }

    const newStatus = over.id as 'not_started' | 'in_progress' | 'done';
    
    // If status hasn't changed, do nothing
    if (draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      // Optimistic update would go here if we were managing local state
      await updateTaskMutation.mutateAsync({
        id: draggedTask.id,
        status: newStatus,
      });
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to update task status:', error);
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDragCancel = () => {
    setDraggedTask(null);
  };

  return {
    draggedTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isUpdating: updateTaskMutation.isPending,
  };
}