import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Reply to message
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {/* Original Message */}
        <div className="bg-muted/30 border-l-4 border-primary/30 pl-4 py-2 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="w-5 h-5">
              <AvatarImage src={parentMessage.sender.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                {parentMessage.sender.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{parentMessage.sender.full_name}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {parentMessage.content}
          </p>
        </div>

        {/* Reply Input */}
        <div className="space-y-3">
          <Textarea
            placeholder="Type your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px]"
            disabled={isPending}
          />
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendReply} 
              disabled={!replyContent.trim() || isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isPending ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyModal;