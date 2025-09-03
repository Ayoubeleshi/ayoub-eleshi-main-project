import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, UserMinus, Search, Crown, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ChannelMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName: string;
  isAdmin?: boolean;
}

const ChannelMembersModal: React.FC<ChannelMembersModalProps> = ({
  open,
  onOpenChange,
  channelId,
  channelName,
  isAdmin = false,
}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Fetch channel members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['channel-members', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channel_members')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('channel_id', channelId);

      if (error) throw error;
      return data;
    },
    enabled: open && !!channelId,
  });

  // Fetch organization users who aren't in the channel
  const { data: availableUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['available-users', channelId, profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .not('id', 'in', `(${members.map(m => m.user_id).join(',') || 'null'})`);

      if (error) throw error;
      return data;
    },
    enabled: open && !!channelId && !!profile?.organization_id && !membersLoading,
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ userId, isModerator = false }: { userId: string; isModerator?: boolean }) => {
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId,
          is_moderator: isModerator,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-members', channelId] });
      queryClient.invalidateQueries({ queryKey: ['available-users', channelId] });
      toast.success('Member added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add member: ' + error.message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channel-members', channelId] });
      queryClient.invalidateQueries({ queryKey: ['available-users', channelId] });
      toast.success('Member removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove member: ' + error.message);
    },
  });

  // Invite by email mutation
  const inviteByEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      // First, check if user exists in organization
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .eq('organization_id', profile?.organization_id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error('Failed to find user');
      }

      if (userProfile) {
        // User exists, add them directly
        await addMemberMutation.mutateAsync({ userId: userProfile.id });
      } else {
        // For now, just show a message that the user needs to be in the organization
        throw new Error('User must be a member of your organization first');
      }
    },
    onSuccess: () => {
      setInviteEmail('');
      toast.success('User invited successfully');
    },
    onError: (error) => {
      toast.error('Failed to invite user: ' + error.message);
    },
  });

  const filteredUsers = availableUsers.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInviteByEmail = () => {
    if (!inviteEmail.trim()) return;
    inviteByEmailMutation.mutate(inviteEmail.trim());
  };

  const isLoading = membersLoading || usersLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>#{channelName} Members</span>
            <Badge variant="secondary">{members.length} members</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Invite Section */}
          {isAdmin && (
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
              <h3 className="font-medium flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </h3>
              
              {/* Invite by email */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleInviteByEmail}
                  disabled={!inviteEmail.trim() || inviteByEmailMutation.isPending}
                  size="sm"
                >
                  {inviteByEmailMutation.isPending ? 'Inviting...' : 'Invite'}
                </Button>
              </div>

              {/* Search available users */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search organization members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Available users list */}
              {filteredUsers.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {user.full_name?.charAt(0) || user.email.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addMemberMutation.mutate({ userId: user.id })}
                        disabled={addMemberMutation.isPending}
                      >
                        <UserPlus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Members */}
          <div className="flex-1 overflow-hidden">
            <h3 className="font-medium mb-3">Current Members</h3>
            
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-y-auto max-h-64 space-y-2">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.profiles?.avatar_url} />
                        <AvatarFallback>
                          {member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.profiles?.full_name || member.profiles?.email}</p>
                        <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                      </div>
                      {member.is_moderator && (
                        <Badge variant="secondary" className="ml-2">
                          <Shield className="w-3 h-3 mr-1" />
                          Moderator
                        </Badge>
                      )}
                    </div>
                    
                    {isAdmin && member.user_id !== profile?.id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMemberMutation.mutate(member.user_id)}
                        disabled={removeMemberMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelMembersModal;