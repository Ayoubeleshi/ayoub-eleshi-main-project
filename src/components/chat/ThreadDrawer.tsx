import React, { useState } from 'react';
import { X, Reply, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageInput from './MessageInput';
import MessageItem from './MessageItem';
import { useThreadMessages } from '@/hooks/useChat';
import { format } from 'date-fns';

interface ThreadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  parentMessage: {
    id: string;
    content: string;
    created_at: string;
    sender: {
      id: string;
      full_name: string;
      avatar_url?: string;
      email: string;
    };
  };
  channelId?: string;
  recipientId?: string;
}

const ThreadDrawer: React.FC<ThreadDrawerProps> = ({
  isOpen,
  onClose,
  parentMessage,
  channelId,
  recipientId,
}) => {
  const { data: threadMessages = [], isLoading } = useThreadMessages(parentMessage.id);

  const renderFormattedText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Reply className="h-4 w-4" />
              Thread
            </SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Parent Message */}
        <div className="p-4 bg-muted/20 border-b">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={parentMessage.sender.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                {parentMessage.sender.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {parentMessage.sender.full_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(parentMessage.created_at), 'MMM d, HH:mm')}
                </span>
              </div>
              <div 
                className="text-sm text-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderFormattedText(parentMessage.content) }}
              />
            </div>
          </div>
        </div>

        {/* Thread Messages */}
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2 border-b bg-background">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}</span>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading thread...</div>
              </div>
            ) : threadMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Reply className="h-8 w-8 text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground">No replies yet</div>
                <div className="text-xs text-muted-foreground">Be the first to reply!</div>
              </div>
            ) : (
              <div className="space-y-2 py-4">
                {threadMessages.map((message, index) => (
                  <MessageItem
                    key={message.id}
                    message={message as any}
                    channelId={channelId}
                    className="thread-message"
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Thread Input */}
          <div className="p-4 border-t bg-background">
            <MessageInput
              channelId={channelId}
              recipientId={recipientId}
              parentMessageId={parentMessage.id}
              placeholder={`Reply to ${parentMessage.sender.full_name}...`}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ThreadDrawer;