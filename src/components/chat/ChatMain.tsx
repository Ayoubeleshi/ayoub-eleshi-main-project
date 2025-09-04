import React, { useState } from 'react';
import { Channel, ChatUser } from '../../types/chat';
import { ChatView } from './ChatLayout';
import { Button } from '../ui/button';
import { ArrowLeft, Hash, User, Users, MessageSquare } from 'lucide-react';
import MessageListWithThreads from './MessageListWithThreads';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import ChannelMembersModal from './ChannelMembersModal';
import CallModal from './CallModal';

interface ChatMainProps {
  currentChannel: Channel | null;
  currentUser: ChatUser | null;
  currentView: ChatView;
  onBackToChannels: () => void;
}

const ChatMain: React.FC<ChatMainProps> = ({
  currentChannel,
  currentUser,
  currentView,
  onBackToChannels,
}) => {
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  const handleStartCall = (type: 'voice' | 'video') => {
    setCallType(type);
    setShowCallModal(true);
  };
  if (currentView === 'channel' && !currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a channel</h3>
          <p className="text-muted-foreground">
            Choose a channel from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'direct' && !currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a person</h3>
          <p className="text-muted-foreground">
            Choose someone from the People tab to start a conversation
          </p>
        </div>
      </div>
    );
  }

  if (currentView === 'users') {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Browse People</h3>
          <p className="text-muted-foreground">
            Select someone to start a direct message conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full min-h-0">
      {/* Header */}
      <ChatHeader
        channel={currentChannel ? {
          id: currentChannel.id,
          name: currentChannel.name,
          description: currentChannel.description,
          isPrivate: currentChannel.is_private,
          memberCount: 0 // TODO: Add member count
        } : undefined}
        user={currentUser ? {
          id: currentUser.id,
          full_name: currentUser.full_name,
          avatar_url: currentUser.avatar_url,
          email: currentUser.email
        } : undefined}
        onSearch={() => {
          // TODO: Implement search
          console.log('Search clicked');
        }}
        onSettings={() => {
          // TODO: Implement settings
          console.log('Settings clicked');
        }}
        onManageMembers={() => setShowMembersModal(true)}
        onStartCall={handleStartCall}
      />

      {/* Messages - Takes up remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Version indicator */}
        <div className="text-xs text-muted-foreground px-4 py-1 bg-muted/20">
          🚀 Version: Latest Deploy Test - {new Date().toLocaleTimeString()}
        </div>
        
        {currentChannel && (
          <MessageListWithThreads channelId={currentChannel.id} />
        )}
        {currentUser && (
          <MessageListWithThreads userId={currentUser.id} />
        )}
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border">
        {currentChannel && (
          <MessageInput
            channelId={currentChannel.id}
            placeholder={`Message #${currentChannel.name}`}
          />
        )}
        {currentUser && (
          <MessageInput
            recipientId={currentUser.id}
            placeholder={`Message ${currentUser.full_name}`}
          />
        )}
      </div>

      {/* Modals */}
      {currentChannel && (
        <ChannelMembersModal
          open={showMembersModal}
          onOpenChange={setShowMembersModal}
          channelId={currentChannel.id}
          channelName={currentChannel.name}
          isAdmin={true} // TODO: Check if user is admin/creator
        />
      )}

      <CallModal
        open={showCallModal}
        onOpenChange={setShowCallModal}
        channelId={currentChannel?.id}
        channelName={currentChannel?.name}
        recipientId={currentUser?.id}
        recipientName={currentUser?.full_name}
        recipientAvatar={currentUser?.avatar_url}
        callType={callType}
      />
    </div>
  );
};

export default ChatMain;
