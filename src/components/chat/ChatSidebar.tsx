import React, { useState } from 'react';
import { 
  Hash, 
  Lock, 
  Plus, 
  Search, 
  Settings, 
  Users, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  MoreHorizontal,
  UserPlus,
  FolderPlus,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useChannels, useOrganizationUsers } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import CreateChannelModal from './CreateChannelModal';
import { useAllUnreadCounts } from '@/hooks/useUnreadMessages';

import { Channel, ChatUser } from '../../types/chat';
import { ChatView } from './ChatLayout';

interface ChatSidebarProps {
  channels: Channel[];
  users: ChatUser[];
  currentChannel: Channel | null;
  currentUser: ChatUser | null;
  currentView: ChatView;
  isLoading: boolean;
  onChannelSelect: (channel: Channel) => void;
  onUserSelect: (user: ChatUser) => void;
  onViewChange: (view: ChatView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface ChannelCategory {
  id: string;
  name: string;
  channels: Array<{
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    unreadCount: number;
    isMuted: boolean;
  }>;
  isCollapsed: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  users,
  currentChannel,
  currentUser,
  currentView,
  isLoading,
  onChannelSelect,
  onUserSelect,
  onViewChange,
  collapsed,
  onToggleCollapse,
}) => {
  const { profile } = useAuth();
  const [view, setView] = useState<'channels' | 'people'>(currentView === 'users' ? 'people' : 'channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  
  // Get unread counts for all channels and DMs
  const { data: unreadCounts = { channels: {}, dms: {} } } = useAllUnreadCounts();
  
  // Convert real channels to categories using useMemo to prevent infinite loops
  const realChannels = React.useMemo(() => channels.map(channel => ({
    id: channel.id,
    name: channel.name,
    description: channel.description,
    isPrivate: channel.is_private,
    unreadCount: unreadCounts.channels[channel.id] || 0,
    isMuted: false
  })), [channels, unreadCounts.channels]);

  // Create categories directly from real channels to avoid state management issues
  const categories: ChannelCategory[] = [
    {
      id: '1',
      name: 'Channels',
      isCollapsed: false,
      channels: realChannels
    }
  ];

  // Remove the problematic useEffect that causes infinite loops

  // Since we're not using state for categories, we'll handle collapse differently
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredChannels = categories.flatMap(cat => 
    cat.channels.filter(channel => 
      channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUnreadTotal = () => {
    return realChannels.reduce((sum, channel) => sum + channel.unreadCount, 0);
  };

  return (
    <div className={`w-64 bg-muted/30 border-r flex flex-col h-screen`}>
        {/* Header */}
        <div className="p-3 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Chat
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if ((window as any).clearCachedProfiles) {
                    (window as any).clearCachedProfiles();
                  }
                  window.location.reload();
                }}
                className="h-8 w-8 p-0"
                title="Clear cache & reload"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Settings clicked')}
                className="h-8 w-8 p-0"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-background h-8 text-sm"
            />
          </div>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-2 space-y-4">
          {/* Channels Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <button
                onClick={() => toggleCategory('channels')}
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {collapsedCategories.has('channels') ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <Hash className="w-4 h-4" />
                <span>Channels</span>
              </button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-muted/50"
                onClick={() => setShowCreateChannel(true)}
                title="Create channel"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {!collapsedCategories.has('channels') && (
              <div className="space-y-1 ml-2">
                {realChannels.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No channels yet</p>
                    <p className="text-xs">Create your first channel to get started!</p>
                  </div>
                ) : (
                  realChannels
                    .filter(channel => channel.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => onChannelSelect(channels.find(c => c.id === channel.id)!)}
                        className={cn(
                          "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md transition-colors group",
                          currentChannel?.id === channel.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                          channel.unreadCount > 0 && "font-semibold"
                        )}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {channel.isPrivate ? (
                            <Lock className="w-3 h-3 flex-shrink-0" />
                          ) : (
                            <Hash className="w-3 h-3 flex-shrink-0" />
                          )}
                          <span className={cn("truncate text-xs", channel.unreadCount > 0 && "font-bold")}>
                            {channel.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {channel.isMuted && (
                            <BellOff className="w-3 h-3 text-muted-foreground" />
                          )}
                          {channel.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-4 min-w-[16px] text-xs px-1 py-0">
                              {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))
                )}
              </div>
            )}
          </div>

          {/* Direct Messages Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <button
                onClick={() => toggleCategory('dms')}
                className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {collapsedCategories.has('dms') ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                <MessageSquare className="w-4 h-4" />
                <span>Direct messages</span>
              </button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-muted/50"
                title="Start new DM"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {!collapsedCategories.has('dms') && (
              <div className="space-y-1 ml-2">
                {/* Recent DMs - placeholder for now */}
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No recent conversations
                </div>
                
                {/* Online Users */}
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Online — {users.filter(u => u.is_online && u.id !== profile?.id).length}
                  </div>
                  {users
                    .filter(user => user.is_online && user.id !== profile?.id)
                    .filter(user => 
                      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user) => {
                      const userUnreadCount = unreadCounts.dms[user.id] || 0;
                      return (
                        <button
                          key={user.id}
                          onClick={() => onUserSelect(user)}
                          className={cn(
                            "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md transition-colors group",
                            currentUser?.id === user.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                            userUnreadCount > 0 && "font-semibold"
                          )}
                        >
                        <div className="relative">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs font-medium">
                              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-background rounded-full" />
                        </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className={cn("text-xs truncate", userUnreadCount > 0 ? "font-bold" : "font-medium")}>
                              {user.full_name}
                            </div>
                            <div className="text-xs truncate opacity-60">{user.role}</div>
                          </div>
                          {userUnreadCount > 0 && (
                            <Badge variant="destructive" className="h-4 min-w-[16px] text-xs px-1 py-0">
                              {userUnreadCount > 99 ? '99+' : userUnreadCount}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                </div>

                {/* Offline Users */}
                {users.filter(u => !u.is_online && u.id !== profile?.id).length > 0 && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Offline — {users.filter(u => !u.is_online && u.id !== profile?.id).length}
                    </div>
                    {users
                      .filter(user => !user.is_online && user.id !== profile?.id)
                      .filter(user => 
                        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 5) // Show only first 5 offline users to save space
                      .map((user) => {
                        const userUnreadCount = unreadCounts.dms[user.id] || 0;
                        return (
                          <button
                            key={user.id}
                            onClick={() => onUserSelect(user)}
                            className={cn(
                              "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md transition-colors group",
                              currentUser?.id === user.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                              userUnreadCount > 0 && "font-semibold"
                            )}
                          >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                            <div className="flex-1 min-w-0 text-left">
                              <div className={cn("text-xs truncate", userUnreadCount > 0 ? "font-bold" : "font-medium")}>
                                {user.full_name}
                              </div>
                              <div className="text-xs truncate opacity-60">{user.role}</div>
                            </div>
                            {userUnreadCount > 0 && (
                              <Badge variant="destructive" className="h-4 min-w-[16px] text-xs px-1 py-0">
                                {userUnreadCount > 99 ? '99+' : userUnreadCount}
                              </Badge>
                            )}
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - User Profile */}
      <div className="p-2 border-t bg-background/95 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-medium">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{profile?.full_name}</div>
            <div className="text-xs text-muted-foreground truncate">{profile?.email}</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MessageSquare className="w-4 h-4 mr-2" />
                Set status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
                 </div>
       </div>

       {/* Create Channel Modal */}
       <CreateChannelModal
         open={showCreateChannel}
         onOpenChange={setShowCreateChannel}
       />
     </div>
   );
 };

export default ChatSidebar;
