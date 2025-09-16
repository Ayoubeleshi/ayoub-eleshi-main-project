import React, { useState, useEffect } from 'react';
import { Channel, ChatUser } from '../../types/chat';
import { useChannels, useOrganizationUsers } from '../../hooks/useChat';
import ChatSidebar from './ChatSidebar';
import ChatMain from './ChatMain';
import { useAuth } from '../../hooks/useAuth';

export type ChatView = 'channel' | 'direct' | 'users';

export interface ChatLayoutProps {
  className?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ className = '' }) => {
  const { profile } = useAuth();
  const [currentView, setCurrentView] = useState<ChatView>('channel');
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: channels = [], isLoading: channelsLoading } = useChannels();
  const { data: users = [], isLoading: usersLoading } = useOrganizationUsers();

  // Auto-select first channel when channels load
  useEffect(() => {
    if (channels.length > 0 && !currentChannel && !currentUser && currentView === 'channel') {
      console.log('🚀 Auto-selecting first channel:', channels[0]);
      setCurrentChannel(channels[0]);
    }
  }, [channels, currentChannel, currentUser, currentView]);

  const handleChannelSelect = (channel: Channel) => {
    console.log('🎯 Channel selected:', channel);
    console.log('🎯 Setting currentChannel to:', channel);
    setCurrentChannel(channel);
    setCurrentUser(null);
    setCurrentView('channel');
  };

  const handleUserSelect = (user: ChatUser) => {
    if (user.id === profile?.id) return; // Can't message yourself
    setCurrentUser(user);
    setCurrentChannel(null);
    setCurrentView('direct');
  };

  const handleViewChange = (view: ChatView) => {
    setCurrentView(view);
    setCurrentChannel(null);
    setCurrentUser(null);
  };

  // Debug logging
  console.log('🔍 ChatLayout render:', {
    currentChannel: currentChannel?.name,
    currentUser: currentUser?.full_name,
    currentView,
    channelsCount: channels.length
  });

  return (
    <div className={`flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden ${className}`}>
      {/* Chat Sidebar */}
      <div className="flex-shrink-0 h-full">
        <ChatSidebar
          channels={channels}
          users={users}
          currentChannel={currentChannel}
          currentUser={currentUser}
          currentView={currentView}
          isLoading={channelsLoading || usersLoading}
          onChannelSelect={handleChannelSelect}
          onUserSelect={handleUserSelect}
          onViewChange={handleViewChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <ChatMain
          currentChannel={currentChannel}
          currentUser={currentUser}
          currentView={currentView}
          onBackToChannels={() => {
            setCurrentView('channel');
            setCurrentChannel(null);
            setCurrentUser(null);
          }}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
