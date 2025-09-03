import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_by?: string;
  assigned_to?: string;
  project_id?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  creator?: {
    id: string;
    full_name?: string;
    email: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
  project_id?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

export interface TaskFilters {
  search?: string;
  status?: string[];
  assignee?: string;
  project_id?: string;
}

export function useTasks(filters?: TaskFilters) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      console.log('useTasks: Starting query with filters:', filters);
      console.log('useTasks: Profile organization_id:', profile?.organization_id);
      
      if (!profile?.organization_id) {
        console.log('useTasks: No organization_id, returning empty array');
        return [];
      }

      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!assigned_to(id, full_name, email, avatar_url),
          creator:profiles!created_by(id, full_name, email)
        `)
        .eq('organization_id', profile.organization_id);

      console.log('useTasks: Base query with organization_id:', profile.organization_id);

      // Apply filters
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
        console.log('useTasks: Applied search filter:', filters.search);
      }
      
      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
        console.log('useTasks: Applied status filter:', filters.status);
      }
      
      if (filters?.assignee) {
        query = query.eq('assigned_to', filters.assignee);
        console.log('useTasks: Applied assignee filter:', filters.assignee);
      }

      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
        console.log('useTasks: Applied project_id filter:', filters.project_id);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('useTasks: Error fetching tasks:', error);
        throw error;
      }

      console.log('useTasks: Successfully fetched tasks:', data?.length || 0, 'tasks');
      console.log('useTasks: Task data:', data);

      return (data || []) as Task[];
    },
    enabled: !!profile?.organization_id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      console.log('useCreateTask: Attempting to create task with data:', taskData);
      
      // Debug: Check current user and profile
      const { data: { user } } = await supabase.auth.getUser();
      console.log('useCreateTask: Current user:', user?.id);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Debug: Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, organization_id')
        .eq('user_id', user.id)
        .single();
        
      console.log('useCreateTask: Profile check:', { profile, profileError });
      
      if (!profile) {
        throw new Error('User profile not found. Please refresh and try again.');
      }
      
      const { data, error } = await supabase.rpc('create_task', {
        p_title: taskData.title,
        p_description: taskData.description,
        p_status: taskData.status || 'not_started',
        p_priority: taskData.priority || 'medium',
        p_due_date: taskData.due_date,
        p_assigned_to: taskData.assigned_to,
        p_project_id: taskData.project_id,
      });

      if (error) {
        console.error('useCreateTask: RPC call failed:', error);
        throw error;
      }
      
      console.log('useCreateTask: Successfully created task:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('useCreateTask: Invalidating queries and showing toast');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task created successfully' });
    },
    onError: (error: any) => {
      console.error('useCreateTask: Error in mutation:', error);
      toast({
        title: 'Failed to create task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: UpdateTaskData) => {
      const { id, ...updates } = taskData;
      
      const { data, error } = await supabase.rpc('update_task', {
        p_task_id: id,
        p_title: updates.title,
        p_description: updates.description,
        p_status: updates.status,
        p_priority: updates.priority,
        p_due_date: updates.due_date,
        p_assigned_to: updates.assigned_to,
        p_project_id: updates.project_id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      console.error('Error updating task:', error);
      toast({
        title: 'Failed to update task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase.rpc('delete_task', {
        p_task_id: taskId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task deleted successfully' });
    },
    onError: (error: any) => {
      console.error('Error deleting task:', error);
      toast({
        title: 'Failed to delete task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTeamMembers() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('organization_id', profile.organization_id)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.organization_id,
  });
}