import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import MessageItem from './MessageItem';
import ThreadDrawer from './ThreadDrawer';
import { useChannelMessages, useDirectMessages, useThreadMessages, useChatRealtime } from '@/hooks/useChat';
import { useMarkAsRead } from '@/hooks/useUnreadMessages';
import { formatDistanceToNow } from 'date-fns';

interface MessageListWithThreadsProps {
  channelId?: string;
  userId?: string;
}

const MessageListWithThreads: React.FC<MessageListWithThreadsProps> = ({
  channelId,
  userId,
}) => {
  const [threadDrawerOpen, setThreadDrawerOpen] = useState(false);
  const [selectedThreadMessage, setSelectedThreadMessage] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages based on whether it's a channel or direct message
  const { 
    data: channelMessages = [], 
    isLoading: isLoadingChannel 
  } = useChannelMessages(channelId || '');
  
  const { 
    data: directMessages = [], 
    isLoading: isLoadingDM 
  } = useDirectMessages(userId || '');
  
  const { mutate: markAsRead } = useMarkAsRead();
  
  // Set up real-time subscriptions
  const realtime = useChatRealtime(channelId, userId);
  
  const messages = channelId ? channelMessages : directMessages;
  const isLoading = channelId ? isLoadingChannel : isLoadingDM;

  // Group messages by thread
  const groupedMessages = React.useMemo(() => {
    const mainMessages = messages.filter(msg => !(msg as any).reply_to_message_id);
    const threadMessages = messages.filter(msg => (msg as any).reply_to_message_id);
    
    // Create a map of thread counts
    const threadCounts: Record<string, number> = {};
    threadMessages.forEach(msg => {
      const replyId = (msg as any).reply_to_message_id;
      if (replyId) {
        threadCounts[replyId] = (threadCounts[replyId] || 0) + 1;
      }
    });
    
    return { mainMessages, threadCounts };
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages]);

  // Mark as read when viewing messages
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        if (channelId) {
          markAsRead({ channelId });
        } else if (userId) {
          markAsRead({ userId });
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, channelId, userId, markAsRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenThread = (message: any) => {
    setSelectedThreadMessage(message);
    setThreadDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
            💬
          </div>
          <p className="text-sm">No messages yet</p>
          <p className="text-xs">Start the conversation!</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const messagesByDate = groupedMessages.mainMessages.reduce((groups: Record<string, any[]>, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(messagesByDate).map(([date, msgs]) => (
        <div key={date} className="space-y-2">
          {/* Date separator */}
          <div className="flex items-center justify-center">
            <div className="bg-muted px-2 py-1 rounded text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(date), { addSuffix: true })}
            </div>
          </div>
          
          {/* Messages for this date */}
          {msgs.map((message, index) => {
            const threadCount = groupedMessages.threadCounts[message.id] || 0;
            const isThreadParent = threadCount > 0;
            const showAvatar = index === 0 || msgs[index - 1]?.sender.id !== message.sender.id;
            
            return (
              <MessageItem
                key={message.id}
                message={message}
                channelId={channelId}
                recipientId={userId}
                isThreadParent={isThreadParent}
                threadCount={threadCount}
                onOpenThread={() => handleOpenThread(message)}
                className={showAvatar ? '' : 'ml-8'}
              />
            );
          })}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
      
      {/* Thread Drawer */}
      {selectedThreadMessage && (
        <ThreadDrawer
          isOpen={threadDrawerOpen}
          onClose={() => setThreadDrawerOpen(false)}
          parentMessage={selectedThreadMessage}
          channelId={channelId}
          recipientId={userId}
        />
      )}
    </div>
  );
};

export default MessageListWithThreads;