import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Hash, 
  Lock, 
  Pin,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  channel?: {
    id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
  };
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
  };
  onDeleteChannel?: () => void;
  onViewPinned?: () => void;
  className?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  channel,
  user,
  onDeleteChannel,
  onViewPinned,
  className = '',
}) => {

  return (
    <div className={`border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Side - Channel Info */}
        <div className="flex items-center space-x-3">
          {channel ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-lg">#</span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {channel.name}
                    </h2>
                    {channel.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {channel.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
            </>
          ) : user ? (
            <>
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white font-medium text-sm">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {user.full_name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Hash className="w-4 h-4 text-slate-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Select a channel or user
              </h2>
            </div>
          )}
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-2">


          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700">
                <MoreHorizontal className="w-4 h-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onViewPinned} className="text-slate-700 dark:text-slate-300">
                <Pin className="w-4 h-4 mr-2" />
                View pinned items
              </DropdownMenuItem>
              {channel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                    onClick={onDeleteChannel}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete channel
                  </DropdownMenuItem>
                </>
              )}
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
