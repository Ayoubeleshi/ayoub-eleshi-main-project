import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  ThumbsUp, 
  Heart, 
  Smile, 
  Clock,
  User,
  Edit,
  Trash2,
  Pin,
  PinOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAddReaction, useMessageReactions, useEditMessage, useDeleteMessage, usePinMessage } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    message_type: 'text' | 'file' | 'image' | 'link';
    file_url?: string;
    created_at: string;
    is_pinned?: boolean;
    sender: {
      id: string;
      full_name: string;
      avatar_url?: string;
      email: string;
    };
  };
  channelId?: string;
  className?: string;
  showAvatar?: boolean;
  isGrouped?: boolean;
  isFirstInGroup?: boolean;
  density?: 'normal' | 'compact';
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  channelId,
  className = '',
  showAvatar = true,
  isGrouped = false,
  isFirstInGroup = true,
  density = 'normal',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  
  const { profile } = useAuth();
  const { mutate: addReaction } = useAddReaction();
  const { data: reactions = [] } = useMessageReactions(message.id);
  const { mutate: editMessage, isPending: isEditingPending } = useEditMessage();
  const { mutate: deleteMessage, isPending: isDeletingPending } = useDeleteMessage();
  const { mutate: pinMessage, isPending: isPinningPending } = usePinMessage();
  const { toast } = useToast();

  const isOwnMessage = profile?.id === message.sender.id;
  const messageTime = format(new Date(message.created_at), 'HH:mm');
  const messageDate = format(new Date(message.created_at), 'MMM d');

  // Check if current user has already reacted with thumbs up
  const hasUserReacted = reactions.some(reaction => 
    reaction.user_id === profile?.id && reaction.emoji === '👍'
  );


  const handleReaction = (emoji: string) => {
    addReaction({ messageId: message.id, emoji });
  };

  const handlePinToggle = () => {
    pinMessage({ 
      messageId: message.id, 
      isPinned: !message.is_pinned 
    }, {
      onSuccess: () => {
        toast({
          title: message.is_pinned ? "Message unpinned" : "Message pinned",
          description: message.is_pinned 
            ? "Message has been unpinned from this channel" 
            : "Message has been pinned to this channel",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update message pin status",
          variant: "destructive",
        });
      }
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false);
      return;
    }

    editMessage({
      messageId: message.id,
      content: editContent.trim(),
      channelId,
    }, {
      onSuccess: () => {
        setIsEditing(false);
        toast({
          title: "Message updated",
          description: "Your message has been updated successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to update message. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    deleteMessage({
      messageId: message.id,
      channelId,
    }, {
      onSuccess: () => {
        toast({
          title: "Message deleted",
          description: "Your message has been deleted successfully.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete message. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  // Function to render formatted text
  const renderFormattedText = (text: string) => {
    // Check if content is already HTML (from rich text editor)
    if (text.includes('<') && text.includes('>')) {
      // Content is HTML, return as-is with proper styling
      return text
        .replace(/<strong>/g, '<strong class="font-bold">')
        .replace(/<em>/g, '<em class="italic">')
        .replace(/<code>/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs font-mono">')
        .replace(/<pre>/g, '<pre class="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-x-auto font-mono">')
        .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-purple-300 dark:border-purple-600 pl-2 italic">')
        .replace(/<ul>/g, '<ul class="list-disc ml-4">')
        .replace(/<ol>/g, '<ol class="list-decimal ml-4">')
        .replace(/<a /g, '<a class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" ');
    }
    
    // Fallback to markdown parsing for backward compatibility
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs font-mono">$1</code>') // Inline code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-x-auto font-mono"><code>$1</code></pre>') // Code block
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-purple-300 dark:border-purple-600 pl-2 italic">$1</blockquote>') // Quote
      .replace(/^- (.*$)/gm, '<li class="list-disc ml-4">$1</li>') // Bullet list
      .replace(/^\d+\. (.*$)/gm, '<li class="list-decimal ml-4">$1</li>') // Numbered list
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>'); // Links
  };

  const renderMessageContent = () => {
    switch (message.message_type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img 
              src={message.file_url} 
              alt="Shared image"
              className="max-w-sm rounded-lg border shadow-sm"
            />
            {message.content && (
              <div 
                className="text-sm text-foreground"
                dangerouslySetInnerHTML={{ __html: renderFormattedText(message.content) }}
              />
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border max-w-sm">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">📎</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {message.content || 'Shared file'}
              </p>
              <p className="text-xs text-muted-foreground">Click to download</p>
            </div>
          </div>
        );
      
      case 'link':
        return (
          <div className="space-y-2">
            <div className="p-3 bg-muted/30 rounded-lg border max-w-sm">
              <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                {message.content}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 text-sm bg-background border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isEditingPending}
                  >
                    {isEditingPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isEditingPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: renderFormattedText(message.content) }}
              />
            )}
          </div>
        );
    }
  };

  const isCompact = density === 'compact';
  const avatarSize = isGrouped ? 'w-6 h-6' : 'w-7 h-7';
  const textSize = isCompact ? 'text-sm' : 'text-[15px]';
  const lineHeight = isCompact ? 'leading-5' : 'leading-[1.5]';
  const verticalSpacing = isFirstInGroup ? (isCompact ? 'mt-2' : 'mt-3') : (isGrouped ? 'mt-1' : (isCompact ? 'mt-2' : 'mt-3'));

  return (
    <motion.div 
      className={cn("relative", verticalSpacing, className)}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Message Container */}
      <div className="flex items-start gap-3 px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group relative">
        {/* Hover Actions - Right aligned, only show on message hover */}
        <div 
          className="absolute top-0 right-3 opacity-0 group-hover:opacity-100 z-10 flex items-center gap-1 -translate-y-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg px-2 py-1 transition-opacity duration-200"
        >
            {/* React Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 border shadow-sm ${
                  hasUserReacted 
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' 
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600'
                }`}
                onClick={() => handleReaction('👍')}
              >
                <ThumbsUp className={`h-3 w-3 ${
                  hasUserReacted 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-600 dark:text-slate-400'
                }`} />
              </Button>
            </motion.div>
            
            {/* Pin Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm"
                onClick={handlePinToggle}
                disabled={isPinningPending}
              >
                {message.is_pinned ? (
                  <PinOff className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Pin className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                )}
              </Button>
            </motion.div>
            
            {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm">
                    <MoreHorizontal className="h-3 w-3 text-slate-600 dark:text-slate-400" />
              </Button>
                </motion.div>
            </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handlePinToggle} className="text-slate-700 dark:text-slate-300" disabled={isPinningPending}>
                  {message.is_pinned ? (
                    <>
                      <PinOff className="w-4 h-4 mr-2" />
                      Unpin message
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4 mr-2" />
                      Pin message
                    </>
                  )}
              </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-slate-700 dark:text-slate-300"
                  onClick={() => {
                    navigator.clipboard.writeText(new Date(message.created_at).toISOString());
                    toast({
                      title: "Timestamp copied",
                      description: "Message timestamp has been copied to clipboard.",
                    });
                  }}
                >
                <Clock className="w-4 h-4 mr-2" />
                Copy timestamp
              </DropdownMenuItem>
              {isOwnMessage && (
                <>
                    <DropdownMenuItem onClick={handleEdit} className="text-slate-700 dark:text-slate-300">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete message
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Avatar Column - 36px width */}
        <div className="flex-shrink-0 w-9">
          {showAvatar ? (
            <Avatar className={cn(avatarSize, 'mt-0.5')}>
              <AvatarImage src={message.sender.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xs font-medium">
                {message.sender.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className={cn(avatarSize, 'mt-0.5')} /> // Spacer when no avatar
          )}
        </div>

        {/* Content Column - flex-1 */}
        <div className="flex-1 min-w-0">
          {/* Pinned Message Indicator */}
          {message.is_pinned && (
            <div className="flex items-center gap-1 mb-1 text-xs text-purple-600 dark:text-purple-400">
              <Pin className="w-3 h-3" />
              <span>Pinned</span>
            </div>
          )}

          {/* Message Header - Only show for first message in group */}
          {isFirstInGroup && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[14px] font-semibold text-slate-900 dark:text-slate-100">
                {message.sender.full_name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {messageTime}
              </span>
              {messageDate !== format(new Date(), 'MMM d') && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {messageDate}
                </span>
              )}
        </div>
          )}

          {/* Message Body */}
          <div className={cn("text-slate-700 dark:text-slate-300", textSize, lineHeight)}>
            {renderMessageContent()}
      </div>


          {/* Reactions - Left aligned below message */}
          {reactions.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-1 mt-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {reactions.map((reaction) => (
                <motion.div
                  key={reaction.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                >
                  <Badge
                    className="text-xs px-2 py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group/reaction relative bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    onClick={() => handleReaction(reaction.emoji || '👍')}
                  >
                    {reaction.emoji || '👍'}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover/reaction:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {(reaction as any).profiles?.full_name || 'User'}
                    </span>
                  </Badge>
                </motion.div>
              ))}
            </motion.div>
          )}
      </div>

      </div>

    </motion.div>
  );
};

export default MessageItem;
