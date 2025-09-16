import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  created_by?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: {
    id: string;
    full_name?: string;
    email: string;
  };
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed';
}

export function useProjects() {
  const { profile, isLoading: authLoading } = useAuth();
  
  console.log('useProjects: Hook called with:', { 
    profile: !!profile, 
    organization_id: profile?.organization_id, 
    authLoading 
  });
  
  return useQuery({
    queryKey: ['projects', profile?.organization_id],
    queryFn: async () => {
      console.log('useProjects: Starting query');
      console.log('useProjects: Profile organization_id:', profile?.organization_id);
      console.log('useProjects: Auth loading:', authLoading);
      
      if (!profile?.organization_id) {
        console.log('useProjects: No organization_id, returning empty array');
        return [];
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useProjects: Error fetching projects:', error);
        throw error;
      }

      console.log('useProjects: Successfully fetched projects:', data?.length || 0, 'projects');
      console.log('useProjects: Project data:', data);

      return (data || []) as Project[];
    },
    enabled: !!profile?.organization_id,
    retry: 3,
    retryDelay: 1000,
  });
}

export function useProject(projectId: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      if (!profile?.organization_id || !projectId) return null;

      // Fetch project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('organization_id', profile.organization_id)
        .single();

      if (projectError) {
        if (projectError.code === 'PGRST116') return null; // Not found
        console.error('Error fetching project:', projectError);
        throw projectError;
      }

      // Fetch tasks for this project
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          created_at,
          updated_at,
          assigned_to:profiles!tasks_assigned_to_fkey(
            id,
            full_name,
            email
          )
        `)
        .eq('project_id', projectId)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        // Don't throw error for tasks, just return project without tasks
      }

      // Debug: Log the raw task data
      console.log('🔧 useProject: Raw tasks data:', tasks);

      // Clean and validate task data
      const cleanTasks = (tasks || []).map((task: any) => {
        // Ensure status is a valid string
        let cleanStatus = task.status;
        if (typeof task.status === 'string' && task.status.length > 20) {
          // If status looks like a UUID, set it to a default value
          console.warn('🔧 useProject: Invalid status detected, setting to default:', task.status);
          cleanStatus = 'not_started';
        }
        
        // Ensure priority is valid
        let cleanPriority = task.priority;
        if (!['low', 'medium', 'high'].includes(task.priority)) {
          console.warn('🔧 useProject: Invalid priority detected, setting to default:', task.priority);
          cleanPriority = 'medium';
        }

        return {
          ...task,
          status: cleanStatus,
          priority: cleanPriority
        };
      });

      console.log('🔧 useProject: Cleaned tasks:', cleanTasks);

      // Combine project and tasks
      const projectWithTasks = {
        ...project,
        tasks: cleanTasks
      };

      return projectWithTasks as Project;
    },
    enabled: !!profile?.organization_id && !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      console.log('useCreateProject: Attempting to create project with data:', projectData);
      
      // Debug: Check current user and profile
      const { data: { user } } = await supabase.auth.getUser();
      console.log('useCreateProject: Current user:', user?.id);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Debug: Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, organization_id')
        .eq('user_id', user.id)
        .single();
        
      console.log('useCreateProject: Profile check:', { profile, profileError });
      
      if (!profile) {
        throw new Error('User profile not found. Please refresh and try again.');
      }
      
      const { data, error } = await supabase.rpc('create_project', {
        p_name: projectData.name,
        p_description: projectData.description,
        p_status: projectData.status || 'active',
      });

      if (error) {
        console.error('useCreateProject: RPC call failed:', error);
        throw error;
      }
      
      console.log('useCreateProject: Successfully created project:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('useCreateProject: Invalidating queries and showing toast');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Board created successfully' });
    },
    onError: (error: any) => {
      console.error('useCreateProject: Error in mutation:', error);
      toast({
        title: 'Failed to create board',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      console.log('useDeleteProject: Deleting project:', projectId);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('useDeleteProject: Supabase error:', error);
        throw new Error(error.message);
      }

      return projectId;
    },
    onSuccess: (projectId) => {
      console.log('useDeleteProject: Successfully deleted project:', projectId);
      
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Also invalidate tasks since they might be affected
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Toast will be handled by the component
      console.log('useDeleteProject: Queries invalidated successfully');
    },
    onError: (error: any) => {
      console.error('useDeleteProject: Error in mutation:', error);
      toast({
        title: 'Failed to delete project',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}