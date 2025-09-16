import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  MoreHorizontal, 
  Reply, 
  ThumbsUp, 
  Heart, 
  Smile, 
  Plus,
  MessageSquare,
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
import { useAddReaction, useMessageReactions, useEditMessage, useDeleteMessage, usePinMessage, useThreadCount } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import ReplyModal from './ReplyModal';
import ThreadView from './ThreadView';
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
  isThreadParent?: boolean;
  onReply?: () => void;
  className?: string;
  showAvatar?: boolean;
  density?: 'default' | 'compact';
  isFirstInGroup?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  channelId,
  isThreadParent = false,
  onReply,
  className = '',
  showAvatar = true,
  density = 'default',
  isFirstInGroup = true,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showThreadView, setShowThreadView] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  
  const { profile } = useAuth();
  const { mutate: addReaction } = useAddReaction();
  const { data: reactions = [] } = useMessageReactions(message.id);
  const { mutate: editMessage, isPending: isEditingPending } = useEditMessage();
  const { mutate: deleteMessage, isPending: isDeletingPending } = useDeleteMessage();
  const { mutate: pinMessage, isPending: isPinningPending } = usePinMessage();
  const { data: threadCount = 0 } = useThreadCount(message.id);
  const { toast } = useToast();

  const isOwnMessage = profile?.id === message.sender.id;
  const messageTime = format(new Date(message.created_at), 'HH:mm');
  const messageDate = format(new Date(message.created_at), 'MMM d');

  const quickReactions = ['👍', '❤️', '😊', '🎉', '👏', '🔥'];

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
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-xs">$1</code>') // Inline code
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-2 rounded text-xs overflow-x-auto"><code>$1</code></pre>') // Code block
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary/30 pl-2 italic">$1</blockquote>') // Quote
      .replace(/^- (.*$)/gm, '<li class="list-disc ml-4">$1</li>') // Bullet list
      .replace(/^\d+\. (.*$)/gm, '<li class="list-decimal ml-4">$1</li>') // Numbered list
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'); // Links
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

  return (
    <div className={cn("group relative", className)}>
      {/* Message Container */}
      <div className="flex space-x-3 px-3 py-1.5 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors rounded-md">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={message.sender.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-sm font-medium">
                {message.sender.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8" /> // Spacer when no avatar
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Message Header */}
          {showAvatar && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
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
          <div className={cn("text-sm text-slate-900 dark:text-slate-100 leading-relaxed", !showAvatar && "ml-0")}>
            {message.is_pinned && (
              <div className="flex items-center gap-1 mb-1 text-xs text-purple-600 dark:text-purple-400">
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
              </div>
            )}
            {renderMessageContent()}
          </div>

          {/* Reactions */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {reactions.map((reaction) => (
                <Badge
                  key={reaction.id}
                  className="text-xs px-2 py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group/reaction relative bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  onClick={() => handleReaction(reaction.emoji || '👍')}
                >
                  {reaction.emoji || '👍'}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover/reaction:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {(reaction as any).profiles?.full_name || 'User'}
                  </span>
                </Badge>
              ))}
            </div>
          )}

          {/* Thread Indicator */}
          {isThreadParent && threadCount > 0 && (
            <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-3 h-3" />
              <span>{threadCount} reply{threadCount !== 1 ? 'ies' : 'y'}</span>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-600 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 shadow-sm">
                <MoreHorizontal className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowReplyModal(true)} className="text-slate-700 dark:text-slate-300">
                <Reply className="w-4 h-4 mr-2" />
                Reply in thread
              </DropdownMenuItem>
              {threadCount > 0 && (
                <DropdownMenuItem onClick={() => setShowThreadView(true)} className="text-slate-700 dark:text-slate-300">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View thread ({threadCount} {threadCount === 1 ? 'reply' : 'replies'})
                </DropdownMenuItem>
              )}
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
              <DropdownMenuItem className="text-slate-700 dark:text-slate-300">
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
      </div>

      {/* Quick Reactions Bar - Only show on hover */}
      <div className="absolute left-11 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
        <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-1">
          {quickReactions.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => handleReaction(emoji)}
            >
              {emoji}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => setShowReactions(!showReactions)}
          >
            <Plus className="h-3 w-3 text-slate-500" />
          </Button>
        </div>
      </div>


      {/* Reply Modal */}
      <ReplyModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        parentMessage={{
          id: message.id,
          content: message.content,
          sender: {
            id: message.sender.id,
            full_name: message.sender.full_name,
            avatar_url: message.sender.avatar_url,
          }
        }}
        channelId={channelId}
      />

      {/* Thread View */}
      <ThreadView
        isOpen={showThreadView}
        onClose={() => setShowThreadView(false)}
        parentMessage={{
          id: message.id,
          content: message.content,
          sender: {
            id: message.sender.id,
            full_name: message.sender.full_name,
            avatar_url: message.sender.avatar_url,
          }
        }}
        channelId={channelId}
      />
    </div>
  );
};

export default MessageItem;
