import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Channel, ChatUser } from '../../types/chat';
import { ChatView } from './ChatLayout';
import { Button } from '../ui/button';
import { ArrowLeft, Hash, User, Users, MessageSquare } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import DeleteChannelModal from './DeleteChannelModal';
import PinnedMessagesModal from './PinnedMessagesModal';
import { useChannelMembers, usePinnedMessages } from '../../hooks/useChat';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPinnedModal, setShowPinnedModal] = useState(false);

  // Get channel members and pinned messages
  const { data: channelMembers = [] } = useChannelMembers(currentChannel?.id || '');
  const { data: pinnedMessages = [] } = usePinnedMessages(currentChannel?.id || '');

  const handleDeleteChannel = () => {
    setShowDeleteModal(true);
  };

  const handleViewPinned = () => {
    setShowPinnedModal(true);
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
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 h-full">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0">
        <ChatHeader
          channel={currentChannel ? {
            id: currentChannel.id,
            name: currentChannel.name,
            description: currentChannel.description,
            isPrivate: currentChannel.is_private,
            memberCount: channelMembers.length,
            pinnedCount: pinnedMessages.length
          } : undefined}
          user={currentUser ? {
            id: currentUser.id,
            full_name: currentUser.full_name,
            avatar_url: currentUser.avatar_url,
            email: currentUser.email
          } : undefined}
          onDeleteChannel={handleDeleteChannel}
          onViewPinned={handleViewPinned}
        />
      </div>

      {/* Messages - Scrollable area that takes remaining space */}
      <div className="main-chat-container flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {currentChannel && (
            <motion.div
              key={`channel-${currentChannel.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <MessageList channelId={currentChannel.id} />
            </motion.div>
          )}
          {currentUser && (
            <motion.div
              key={`user-${currentUser.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <MessageList userId={currentUser.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0">
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
        <DeleteChannelModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          channelId={currentChannel.id}
          channelName={currentChannel.name}
          onChannelDeleted={() => {
            // Go back to channel selection after deletion
            onBackToChannels();
          }}
        />
      )}

      {currentChannel && (
        <PinnedMessagesModal
          isOpen={showPinnedModal}
          onClose={() => setShowPinnedModal(false)}
          channelId={currentChannel.id}
          channelName={currentChannel.name}
        />
      )}
    </div>
  );
};

export default ChatMain;
