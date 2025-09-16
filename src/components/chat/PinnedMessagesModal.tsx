import React from 'react';
import { motion } from 'framer-motion';
import { X, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePinnedMessages, usePinMessage } from '@/hooks/useChat';
import MessageItem from './MessageItem';
import { useToast } from '@/components/ui/use-toast';

interface PinnedMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
}

const PinnedMessagesModal: React.FC<PinnedMessagesModalProps> = ({
  isOpen,
  onClose,
  channelId,
  channelName,
}) => {
  const { data: pinnedMessages = [], isLoading } = usePinnedMessages(channelId);
  const { mutate: pinMessage } = usePinMessage();
  const { toast } = useToast();

  const handleUnpinMessage = (messageId: string) => {
    pinMessage(
      { messageId, isPinned: false },
      {
        onSuccess: () => {
          toast({
            title: "Message unpinned",
            description: "Message has been unpinned from this channel",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to unpin message. Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Pin className="w-5 h-5 text-purple-600" />
            Pinned Messages
            <span className="text-sm font-normal text-slate-500">
              in #{channelName}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            View and manage pinned messages in {channelName} channel
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <motion.div 
              className="flex items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center text-slate-500">Loading pinned messages...</div>
            </motion.div>
          ) : pinnedMessages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Pin className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                No pinned messages
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Pin important messages to keep them easily accessible
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {pinnedMessages.map((message, index) => (
                <motion.div 
                  key={message.id} 
                  className="relative group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.2, 
                    delay: index * 0.05 
                  }}
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
                        id: message.sender?.id || '',
                        full_name: message.sender?.full_name || 'Unknown User',
                        avatar_url: message.sender?.avatar_url,
                        email: message.sender?.email || ''
                      }
                    }}
                    channelId={channelId}
                    showAvatar={true}
                    isGrouped={false}
                    isFirstInGroup={true}
                    density="normal"
                  />
                  
                  {/* Unpin Button - Only show on hover */}
                  <motion.div 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      onClick={() => handleUnpinMessage(message.id)}
                      title="Unpin message"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PinnedMessagesModal;
