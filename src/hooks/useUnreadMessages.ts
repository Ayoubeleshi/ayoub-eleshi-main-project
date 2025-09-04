import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';

export const useChannelUnreadCount = (channelId: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['channel-unread-count', channelId, profile?.id],
    queryFn: async () => {
      if (!channelId || !profile?.id) return 0;
      
      const { data, error } = await supabase.rpc('get_channel_unread_count', {
        p_channel_id: channelId,
        p_user_id: profile.id
      });
      
      if (error) {
        console.error('Error fetching channel unread count:', error);
        return 0;
      }
      
      return data || 0;
    },
    enabled: !!channelId && !!profile?.id,
  });
};

export const useDMUnreadCount = (userId: string) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['dm-unread-count', userId, profile?.id],
    queryFn: async () => {
      if (!userId || !profile?.id) return 0;
      
      const { data, error } = await supabase.rpc('get_dm_unread_count', {
        p_dm_user_id: userId,
        p_current_user_id: profile.id
      });
      
      if (error) {
        console.error('Error fetching DM unread count:', error);
        return 0;
      }
      
      return data || 0;
    },
    enabled: !!userId && !!profile?.id,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async ({ channelId, userId }: { channelId?: string; userId?: string }) => {
      if (!profile?.id) throw new Error('No profile ID');
      
      const updateData = {
        user_id: profile.id,
        last_read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (channelId) {
        // Mark channel as read
        const { error } = await supabase
          .from('user_channel_reads')
          .upsert({
            ...updateData,
            channel_id: channelId,
          });
        
        if (error) throw error;
      } else if (userId) {
        // Mark DM as read
        const { error } = await supabase
          .from('user_channel_reads')
          .upsert({
            ...updateData,
            dm_user_id: userId,
          });
        
        if (error) throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate unread count queries
      if (variables.channelId) {
        queryClient.invalidateQueries({ queryKey: ['channel-unread-count', variables.channelId] });
      } else if (variables.userId) {
        queryClient.invalidateQueries({ queryKey: ['dm-unread-count', variables.userId] });
      }
    },
  });
};

export const useAllUnreadCounts = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['all-unread-counts', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { channels: {}, dms: {} };
      
      // Get all channels for the user's organization
      const { data: channels } = await supabase
        .from('channels')
        .select('id')
        .eq('organization_id', profile.organization_id || '');
      
      // Get all users in the organization (for DMs)
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', profile.organization_id || '')
        .neq('id', profile.id);
      
      const unreadCounts: { channels: Record<string, number>; dms: Record<string, number> } = {
        channels: {},
        dms: {}
      };
      
      // Get unread counts for all channels
      if (channels) {
        for (const channel of channels) {
          const { data: count } = await supabase.rpc('get_channel_unread_count', {
            p_channel_id: channel.id,
            p_user_id: profile.id
          });
          unreadCounts.channels[channel.id] = count || 0;
        }
      }
      
      // Get unread counts for all DMs
      if (users) {
        for (const user of users) {
          const { data: count } = await supabase.rpc('get_dm_unread_count', {
            p_dm_user_id: user.id,
            p_current_user_id: profile.id
          });
          unreadCounts.dms[user.id] = count || 0;
        }
      }
      
      return unreadCounts;
    },
    enabled: !!profile?.id && !!profile?.organization_id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};