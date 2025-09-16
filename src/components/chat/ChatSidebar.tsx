import React, { useState } from 'react';
import { 
  Hash, 
  Lock, 
  Plus, 
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
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  
  // Convert real channels to categories using useMemo to prevent infinite loops
  const realChannels = React.useMemo(() => channels.map(channel => ({
    id: channel.id,
    name: channel.name,
    description: channel.description,
    isPrivate: channel.is_private,
    unreadCount: 0, // TODO: Add unread count logic
    isMuted: false
  })), [channels]);

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

  const filteredChannels = categories.flatMap(cat => cat.channels);
  const filteredUsers = users;

  const getUnreadTotal = () => {
    return realChannels.reduce((sum, channel) => sum + channel.unreadCount, 0);
  };

  return (
    <div className={`w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full`}>
        {/* Workspace Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  TeamFlow
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Business Class
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if ((window as any).clearCachedProfiles) {
                    (window as any).clearCachedProfiles();
                  }
                  window.location.reload();
                }}
                className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Clear cache & reload"
              >
                <RefreshCw className="h-3 w-3 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Settings clicked')}
                className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Settings"
              >
                <Settings className="h-3 w-3 text-slate-500" />
              </Button>
            </div>
          </div>
        </div>


      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2 space-y-6">
          {/* Channels Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <button
                onClick={() => toggleCategory('channels')}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors uppercase tracking-wider"
              >
                {collapsedCategories.has('channels') ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                <span>Channels</span>
              </button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                onClick={() => setShowCreateChannel(true)}
                title="Create channel"
              >
                <Plus className="h-3 w-3 text-slate-500" />
              </Button>
            </div>
            
            {!collapsedCategories.has('channels') && (
              <div className="space-y-0.5 ml-2">
                {realChannels.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No channels yet</p>
                    <p className="text-xs">Create your first channel to get started!</p>
                  </div>
                ) : (
                  realChannels.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => onChannelSelect(channels.find(c => c.id === channel.id)!)}
                        className={cn(
                          "flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md transition-all duration-200 group",
                          currentChannel?.id === channel.id
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 font-medium shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <span className="text-slate-400 dark:text-slate-500 text-xs">#</span>
                          <span className="truncate text-sm">{channel.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {channel.isMuted && (
                            <BellOff className="w-3 h-3 text-slate-400" />
                          )}
                          {channel.unreadCount > 0 && (
                            <Badge className="h-4 min-w-[16px] text-xs bg-red-500 text-white hover:bg-red-600">
                              {channel.unreadCount}
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
                className="flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors uppercase tracking-wider"
              >
                {collapsedCategories.has('dms') ? (
                  <ChevronRight className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
                <span>Direct messages</span>
              </button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                title="Start new DM"
              >
                <Plus className="h-3 w-3 text-slate-500" />
              </Button>
            </div>
            
            {!collapsedCategories.has('dms') && (
              <div className="space-y-0.5 ml-2">
                {/* Online Users */}
                <div className="space-y-1">
                  {users
                    .filter(user => user.is_online && user.id !== profile?.id)
                    .map((user) => (
                      <button
                        key={user.id}
                        onClick={() => onUserSelect(user)}
                        className={cn(
                          "flex items-center space-x-2 w-full px-2 py-1.5 text-sm rounded-md transition-all duration-200 group",
                          currentUser?.id === user.id
                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 font-medium shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                        )}
                      >
                        <div className="relative">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white text-xs font-medium">
                              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-sm font-medium truncate">{user.full_name}</div>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Offline Users */}
                {users.filter(u => !u.is_online && u.id !== profile?.id).length > 0 && (
                  <div className="space-y-1">
                    {users
                      .filter(user => !user.is_online && user.id !== profile?.id)
                      .slice(0, 5) // Show only first 5 offline users to save space
                      .map((user) => (
                        <button
                          key={user.id}
                          onClick={() => onUserSelect(user)}
                          className={cn(
                            "flex items-center space-x-2 w-full px-2 py-1.5 text-sm rounded-md transition-all duration-200 group",
                            currentUser?.id === user.id
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 font-medium shadow-sm"
                              : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                          )}
                        >
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium truncate">{user.full_name}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
