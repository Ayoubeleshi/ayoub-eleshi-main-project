import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChannelMessages, useDirectMessages, useChatRealtime } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import MessageItem from './MessageItem';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  channelId?: string;
  userId?: string;
}

const MessageList: React.FC<MessageListProps> = ({ channelId, userId }) => {
  const { profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: channelMessages = [], isLoading: channelLoading } = useChannelMessages(channelId || '');
  const { data: directMessages = [], isLoading: directLoading } = useDirectMessages(userId || '');
  
  // Set up real-time subscriptions
  useChatRealtime(channelId, userId);
  
  const messages = channelId ? channelMessages : directMessages;
  const isLoading = channelId ? channelLoading : directLoading;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      // Check if user is near the bottom (within 150px) before auto-scrolling
      const isNearBottom = scrollRef.current.scrollTop + scrollRef.current.clientHeight >= scrollRef.current.scrollHeight - 150;
      
      // Only auto-scroll if user is near the bottom or if it's the first message
      if (isNearBottom || messages.length === 1) {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: 'smooth'
            });
          }
        });
      }
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
          <p className="text-muted-foreground">
            Send a message below to get started
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date and sort by created_at (oldest to newest - chronological order)
  // This ensures older messages appear at the top and newer messages at the bottom
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const groupedMessages = sortedMessages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <div 
      ref={scrollRef}
      className="h-full w-full overflow-y-auto overflow-x-hidden"
    >
      <div className="flex flex-col px-4 py-3 bg-slate-50 dark:bg-slate-900">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="mb-4 last:mb-0">
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="flex items-center space-x-3">
                <div className="h-px bg-slate-200/20 dark:bg-slate-700/20 flex-1"></div>
                <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(date), { addSuffix: true })}
                </div>
                <div className="h-px bg-slate-200/20 dark:bg-slate-700/20 flex-1"></div>
              </div>
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-0">
              <AnimatePresence>
                {(dateMessages as any[]).map((message, index) => {
                // Safety check for message object
                if (!message || !message.id) {
                  console.warn('Invalid message object:', message);
                  return null;
                }
                
                const isOwnMessage = message.sender_id === profile?.id;
                const previousMessage = index > 0 ? dateMessages[index - 1] : null;
                const showAvatar = index === 0 || 
                  dateMessages[index - 1]?.sender_id !== message.sender_id;
                
                // Check if messages should be grouped (same author within 5 minutes)
                const shouldGroupWithPrevious = (currentMessage: any, prevMessage: any) => {
                  if (!prevMessage) return false;
                  if (currentMessage.sender_id !== prevMessage.sender_id) return false;
                  
                  const currentTime = new Date(currentMessage.created_at).getTime();
                  const previousTime = new Date(prevMessage.created_at).getTime();
                  const timeDiff = currentTime - previousTime;
                  
                  return timeDiff <= 5 * 60 * 1000; // 5 minutes in milliseconds
                };
                
                const isGrouped = shouldGroupWithPrevious(message, previousMessage);
                const isFirstInGroup = !isGrouped;
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ 
                      duration: 0.2, 
                      ease: "easeOut",
                      delay: index * 0.02 // Stagger animation for multiple messages
                    }}
                    layout
                  >
                    <MessageItem
                      message={{
                        id: message.id,
                        content: message.content,
                        message_type: message.message_type as 'text' | 'file' | 'image' | 'link',
                        file_url: message.file_url,
                        created_at: message.created_at,
                        is_pinned: message.is_pinned,
                        sender: {
                          id: message.sender?.id || message.sender_id || '',
                          full_name: message.sender?.full_name || 'Unknown User',
                          avatar_url: message.sender?.avatar_url,
                          email: message.sender?.email || ''
                        }
                      }}
                      channelId={channelId}
                      className={isOwnMessage ? 'ml-auto' : ''}
                      showAvatar={showAvatar}
                      isGrouped={isGrouped}
                      isFirstInGroup={isFirstInGroup}
                      density="normal"
                    />
                  </motion.div>
                );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;
