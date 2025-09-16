import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  channelName: string;
  onChannelDeleted?: () => void;
}

const DeleteChannelModal: React.FC<DeleteChannelModalProps> = ({
  open,
  onOpenChange,
  channelId,
  channelName,
  onChannelDeleted,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteChannel = async () => {
    if (confirmText !== channelName) {
      toast.error('Channel name does not match');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all messages in the channel first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('channel_id', channelId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
      }

      // Delete channel members
      const { error: membersError } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId);

      if (membersError) {
        console.error('Error deleting channel members:', membersError);
      }

      // Delete the channel
      const { error: channelError } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (channelError) {
        throw channelError;
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });

      toast.success(`Channel "${channelName}" has been deleted`);
      onOpenChange(false);
      setConfirmText('');
      
      if (onChannelDeleted) {
        onChannelDeleted();
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Failed to delete channel. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
      setConfirmText('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Channel
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the channel 
              <span className="font-semibold"> #{channelName}</span> and all of its messages.
            </DialogDescription>
          </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200 mb-1">
                  Warning
                </p>
                <ul className="text-red-700 dark:text-red-300 space-y-1">
                  <li>• All messages in this channel will be lost</li>
                  <li>• All members will be removed from the channel</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text">
              Type <span className="font-semibold">{channelName}</span> to confirm:
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={channelName}
              disabled={isDeleting}
              className="border-red-200 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteChannel}
              disabled={confirmText !== channelName || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Channel
                </>
              )}
            </Button>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal;
