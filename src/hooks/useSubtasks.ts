import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Subtask, CreateSubtaskData, UpdateSubtaskData } from '@/lib/validations/subtask';

// Fetch subtasks for a specific task
export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching subtasks:', error);
        throw new Error('Failed to fetch subtasks');
      }

      return data as Subtask[];
    },
    enabled: !!taskId,
  });
}

// Create a new subtask
export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subtaskData: CreateSubtaskData) => {
      const { data, error } = await supabase
        .from('subtasks')
        .insert({
          ...subtaskData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating subtask:', error);
        throw new Error('Failed to create subtask');
      }

      return data as Subtask;
    },
    onSuccess: (newSubtask) => {
      // Invalidate and refetch subtasks for this task
      queryClient.invalidateQueries({ queryKey: ['subtasks', newSubtask.task_id] });
      
      // Also invalidate tasks to update progress
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: 'Subtask created',
        description: 'The subtask has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subtask',
        variant: 'destructive',
      });
    },
  });
}

// Update an existing subtask
export function useUpdateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSubtaskData) => {
      const { data, error } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subtask:', error);
        throw new Error('Failed to update subtask');
      }

      return data as Subtask;
    },
    onSuccess: (updatedSubtask) => {
      // Invalidate and refetch subtasks for this task
      queryClient.invalidateQueries({ queryKey: ['subtasks', updatedSubtask.task_id] });
      
      // Also invalidate tasks to update progress
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: 'Subtask updated',
        description: 'The subtask has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subtask',
        variant: 'destructive',
      });
    },
  });
}

// Delete a subtask
export function useDeleteSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subtaskId: string) => {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) {
        console.error('Error deleting subtask:', error);
        throw new Error('Failed to delete subtask');
      }

      return subtaskId;
    },
    onSuccess: (subtaskId, variables) => {
      // We need to get the task_id from the cache to invalidate properly
      const subtask = queryClient.getQueryData<Subtask[]>(['subtasks'])?.find(s => s.id === subtaskId);
      if (subtask) {
        queryClient.invalidateQueries({ queryKey: ['subtasks', subtask.task_id] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      
      toast({
        title: 'Subtask deleted',
        description: 'The subtask has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete subtask',
        variant: 'destructive',
      });
    },
  });
}

// Reorder subtasks
export function useReorderSubtasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, subtaskIds }: { taskId: string; subtaskIds: string[] }) => {
      const updates = subtaskIds.map((id, index) => ({
        id,
        order_index: index,
      }));

      const { error } = await supabase
        .from('subtasks')
        .upsert(updates);

      if (error) {
        console.error('Error reordering subtasks:', error);
        throw new Error('Failed to reorder subtasks');
      }

      return { taskId, subtaskIds };
    },
    onSuccess: ({ taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder subtasks',
        variant: 'destructive',
      });
    },
  });
}

// Calculate progress percentage for a task
export function calculateProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0;
  
  const completedCount = subtasks.filter(subtask => subtask.status === 'done').length;
  return Math.round((completedCount / subtasks.length) * 100);
}
