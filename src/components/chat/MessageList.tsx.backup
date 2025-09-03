import React, { useEffect, useRef } from 'react';
import { useChannelMessages, useDirectMessages, useChatRealtime } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { ScrollArea } from '../ui/scroll-area';
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
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Only auto-scroll if user is already near the bottom (like Slack behavior)
        const isNearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 100;
        
        if (isNearBottom) {
          // Use requestAnimationFrame for better timing with DOM updates
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          });
        }
      }
    }
  }, [messages.length, messages]); // React to both length changes and message updates

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
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-muted-foreground">
            {channelId 
              ? "Be the first to start the conversation in this channel!"
              : "Start a conversation by sending a message!"
            }
          </p>
        </div>
      </div>
    );
  }

  // Group messages by date and sort by created_at (oldest to newest - chronological order)
  // This ensures newest messages appear at the bottom like Slack
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
    <ScrollArea className="h-full w-full" ref={scrollRef}>
      <div 
        className="flex flex-col px-2 py-1"
        style={{ 
          display: 'flex', 
          flexDirection: 'column'
        }}
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="mb-3 last:mb-0">
            {/* Date separator */}
            <div className="flex items-center justify-center mb-2">
              <div className="bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(date), { addSuffix: true })}
              </div>
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-2">
              {(dateMessages as any[]).map((message, index) => {
                // Safety check for message object
                if (!message || !message.id) {
                  console.warn('Invalid message object:', message);
                  return null;
                }
                
                const isOwnMessage = message.sender_id === profile?.id;
                const showAvatar = index === 0 || 
                  dateMessages[index - 1]?.sender_id !== message.sender_id;
                
                return (
                  <MessageItem
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      message_type: message.message_type as 'text' | 'file' | 'image' | 'link',
                      file_url: message.file_url,
                      created_at: message.created_at,
                      sender: {
                        id: message.sender?.id || message.sender_id || '',
                        full_name: message.sender?.full_name || 'Unknown User',
                        avatar_url: message.sender?.avatar_url,
                        email: message.sender?.email || ''
                      }
                    }}
                    channelId={channelId}
                    className={isOwnMessage ? 'ml-auto' : ''}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
