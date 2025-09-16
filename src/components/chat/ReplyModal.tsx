import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSendThreadMessage } from '@/hooks/useChat';

interface ReplyModalProps {
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
  recipientId?: string;
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  parentMessage,
  channelId,
  recipientId,
}) => {
  const [replyContent, setReplyContent] = useState('');
  const { mutate: sendReply, isPending } = useSendThreadMessage();

  const handleSendReply = () => {
    if (!replyContent.trim()) return;

    sendReply({
      content: replyContent.trim(),
      parentMessageId: parentMessage.id,
      channelId,
      recipientId,
    }, {
      onSuccess: () => {
        setReplyContent('');
        onClose();
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl border-0 shadow-none bg-transparent p-0">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          {/* Simple Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Reply</h3>
              <p className="sr-only">Reply to message from {parentMessage.sender.full_name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Original Message - Simple Quote */}
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                {parentMessage.sender.full_name}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {parentMessage.content}
            </p>
          </div>

          {/* Simple Reply Input */}
          <div className="p-4">
            <Textarea
              placeholder="Type a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] border border-slate-200 dark:border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isPending}
              autoFocus
            />
            
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={onClose} disabled={isPending} size="sm">
                Cancel
              </Button>
              <Button 
                onClick={handleSendReply} 
                disabled={!replyContent.trim() || isPending}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                {isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyModal;