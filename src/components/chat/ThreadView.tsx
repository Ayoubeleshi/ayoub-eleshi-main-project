import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useThreadMessages } from '@/hooks/useChat';
import MessageItem from './MessageItem';

interface ThreadViewProps {
  isOpen: boolean;
  onClose: () => void;
  parentMessage: {
    id: string;
    content: string;
    sender: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  };
  channelId?: string;
}

const ThreadView: React.FC<ThreadViewProps> = ({
  isOpen,
  onClose,
  parentMessage,
  channelId,
}) => {
  const { data: threadMessages = [], isLoading } = useThreadMessages(parentMessage.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <span className="text-sm font-medium">Thread</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Thread conversation for message: {parentMessage.content}
          </DialogDescription>
        </DialogHeader>
        
        {/* Parent Message */}
        <div className="flex-shrink-0 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-l-4 border-purple-500 rounded-r-lg">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {parentMessage.sender.full_name}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {parentMessage.content}
              </p>
            </div>
          </div>
        </div>

        {/* Thread Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="text-sm text-slate-500">Loading thread messages...</div>
            </div>
          ) : threadMessages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-slate-500">No replies yet</div>
              <div className="text-xs text-slate-400 mt-1">Be the first to reply to this message</div>
            </div>
          ) : (
            threadMessages.map((threadMessage) => (
              <MessageItem
                key={threadMessage.id}
                message={{
                  id: threadMessage.id,
                  content: threadMessage.content,
                  message_type: threadMessage.message_type as 'text' | 'file' | 'image' | 'link',
                  file_url: threadMessage.file_url,
                  created_at: threadMessage.created_at,
                  sender: {
                    id: threadMessage.sender?.id || threadMessage.sender_id || '',
                    full_name: threadMessage.sender?.full_name || 'Unknown User',
                    avatar_url: threadMessage.sender?.avatar_url,
                    email: threadMessage.sender?.email || ''
                  }
                }}
                channelId={channelId}
                showAvatar={true}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThreadView;
