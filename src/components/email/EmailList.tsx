import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  Paperclip,
  Reply,
  Forward,
  Clock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useEmails, useEmailActions, Email } from '@/hooks/useEmail';

interface EmailListProps {
  folderId?: string;
  onEmailSelect: (emailId: string) => void;
  selectedEmailId?: string | null;
  searchQuery?: string;
}

const EmailList: React.FC<EmailListProps> = ({
  folderId,
  onEmailSelect,
  selectedEmailId,
  searchQuery = '',
}) => {
  // Fetch real data from hooks
  const { data: emails = [], isLoading } = useEmails(folderId);
  const { markAsRead, toggleStar, toggleImportant, deleteEmail } = useEmailActions();

  const filteredEmails = emails.filter(email => 
    searchQuery === '' || 
    (email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.body_text?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEmailClick = (emailId: string) => {
    onEmailSelect(emailId);
    // Mark as read when clicked
    markAsRead.mutate({ emailId, isRead: true });
  };

  const handleStarToggle = (emailId: string, isStarred: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar.mutate({ emailId, isStarred });
  };

  const handleEmailAction = (action: string, emailId: string) => {
    switch (action) {
      case 'delete':
        deleteEmail.mutate(emailId);
        break;
      case 'star':
        toggleStar.mutate({ emailId, isStarred: true });
        break;
      case 'unstar':
        toggleStar.mutate({ emailId, isStarred: false });
        break;
      case 'important':
        toggleImportant.mutate({ emailId, isImportant: true });
        break;
      case 'unimportant':
        toggleImportant.mutate({ emailId, isImportant: false });
        break;
      default:
        console.log('Email action:', action, 'for email:', emailId);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Inbox
          </h3>
          <Badge variant="secondary" className="text-xs">
            {filteredEmails.length} emails
          </Badge>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-slate-500">Loading emails...</div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="text-slate-500 mb-2">No emails found</div>
              <div className="text-sm text-slate-400">
                {searchQuery ? 'Try adjusting your search terms' : 'This folder is empty'}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredEmails.map((email, index) => (
            <motion.div
              key={email.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.2,
                delay: index * 0.02
              }}
              className={cn(
                "border-b border-slate-100 dark:border-slate-700 cursor-pointer transition-colors",
                selectedEmailId === email.id 
                  ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700" 
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
              onClick={() => handleEmailClick(email.id)}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {(email.sender_name || email.sender_email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          !email.is_read ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {email.sender_name || email.sender_email}
                        </h4>
                        {email.is_important && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            !
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {email.received_at ? formatDistanceToNow(new Date(email.received_at), { addSuffix: true }) : 'Unknown'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleStarToggle(email.id, !email.is_starred, e)}
                          className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          {email.is_starred ? (
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          ) : (
                            <StarOff className="w-3 h-3 text-slate-400" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                              className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-600"
                            >
                              <MoreHorizontal className="w-3 h-3 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEmailAction('reply', email.id)}>
                              <Reply className="w-4 h-4 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailAction('forward', email.id)}>
                              <Forward className="w-4 h-4 mr-2" />
                              Forward
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEmailAction('archive', email.id)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEmailAction('delete', email.id)}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <h5 className={cn(
                      "text-sm mb-1 truncate",
                      !email.is_read ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {email.subject || '(No Subject)'}
                    </h5>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {email.body_text || email.body_html?.replace(/<[^>]*>/g, '') || 'No preview available'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {email.has_attachments && (
                          <Paperclip className="w-3 h-3 text-slate-400" />
                        )}
                      </div>
                      {!email.is_read && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default EmailList;
