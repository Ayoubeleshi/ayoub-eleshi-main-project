import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  MoreHorizontal, 
  Hash, 
  Lock, 
  Users,
  Pin,
  Info,
  Phone,
  Video,
  UserPlus,
  Wifi,
  WifiOff,
  AlertCircle
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
import { useChatRealtime } from '@/hooks/useChat';

interface ChatHeaderProps {
  channel?: {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    memberCount?: number;
  };
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  onSearch?: () => void;
  onSettings?: () => void;
  onManageMembers?: () => void;
  onStartCall?: (type: 'voice' | 'video') => void;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  channel,
  user,
  onSearch,
  onSettings,
  onManageMembers,
  onStartCall,
  className = '',
}) => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get connection status for real-time
  const { connectionStatus, useFallback } = useChatRealtime(
    channel?.id, 
    user?.id
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch();
    }
  };

  // Connection status indicator
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-3 h-3 text-green-500" />;
      case 'connecting':
        return <Wifi className="w-3 h-3 text-yellow-500 animate-pulse" />;
      case 'error':
        return <WifiOff className="w-3 h-3 text-red-500" />;
      case 'disconnected':
        return <WifiOff className="w-3 h-3 text-gray-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  const getConnectionText = () => {
    if (useFallback) return 'Polling';
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left Side - Channel Info */}
        <div className="flex items-center space-x-2">
          {channel ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {channel.isPrivate ? (
                    <Lock className="w-3 h-3 text-white" />
                  ) : (
                    <Hash className="w-3 h-3 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {channel.isPrivate ? '🔒 ' : '#'}{channel.name}
                  </h2>
                  {channel.description && (
                    <p className="text-xs text-muted-foreground">
                      {channel.description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Channel Stats */}
              <div className="hidden md:flex items-center space-x-3 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{channel.memberCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Pin className="w-3 h-3" />
                  <span>0 pinned</span>
                </div>
              </div>
            </>
          ) : user ? (
            <>
              <Avatar className="w-7 h-7">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-medium text-xs">
                  {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {user.full_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                <Hash className="w-3 h-3 text-muted-foreground" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Select a channel or user
              </h2>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-1">
          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-muted/30">
            {getConnectionIcon()}
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {getConnectionText()}
            </span>
          </div>

          {/* Search - Hidden on mobile */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-7 h-7 bg-muted/50 border-0 focus:bg-background focus:ring-1 focus:ring-ring text-xs"
            />
          </form>

          {/* Mobile search button */}
          <Button variant="ghost" size="sm" className="lg:hidden h-7 w-7 p-0">
            <Search className="w-3 h-3" />
          </Button>

          {/* Call buttons */}
          {(channel || user) && onStartCall && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onStartCall('voice')}
                className="h-7 w-7 p-0"
                title="Start voice call"
              >
                <Phone className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onStartCall('video')}
                className="h-7 w-7 p-0"
                title="Start video call"
              >
                <Video className="w-3 h-3" />
              </Button>
            </>
          )}

          {/* Manage members (channel only) */}
          {channel && onManageMembers && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onManageMembers}
              className="h-7 w-7 p-0"
              title="Manage members"
            >
              <UserPlus className="w-3 h-3" />
            </Button>
          )}

          {/* Settings */}
          <Button variant="ghost" size="sm" onClick={onSettings} className="h-7 w-7 p-0">
            <Settings className="w-3 h-3" />
          </Button>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Search className="w-4 h-4 mr-2" />
                Search in conversation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pin className="w-4 h-4 mr-2" />
                View pinned items
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="w-4 h-4 mr-2" />
                View members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Channel settings
              </DropdownMenuItem>
              {channel?.isPrivate && (
                <DropdownMenuItem className="text-red-600">
                  <Lock className="w-4 h-4 mr-2" />
                  Leave channel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
