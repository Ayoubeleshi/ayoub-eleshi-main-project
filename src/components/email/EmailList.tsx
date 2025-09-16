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

interface Email {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  preview: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  hasAttachments: boolean;
  receivedAt: Date;
  labels: string[];
}

interface EmailListProps {
  onEmailSelect: (emailId: string) => void;
  selectedEmailId?: string | null;
  searchQuery?: string;
}

const EmailList: React.FC<EmailListProps> = ({
  onEmailSelect,
  selectedEmailId,
  searchQuery = '',
}) => {
  // Mock data - will be replaced with real data from hooks
  const [emails] = useState<Email[]>([
    {
      id: '1',
      subject: 'Meeting Tomorrow - Project Update',
      sender: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
      },
      preview: 'Hey team, just wanted to confirm our meeting tomorrow at 2pm. We\'ll be discussing the Q4 roadmap and budget allocation...',
      isRead: false,
      isStarred: true,
      isImportant: true,
      hasAttachments: true,
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      labels: ['work', 'meeting']
    },
    {
      id: '2',
      subject: 'Re: Design System Updates',
      sender: {
        name: 'Mike Chen',
        email: 'mike.chen@company.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
      },
      preview: 'Thanks for the feedback! I\'ve updated the color palette and typography guidelines. The new components are ready for review...',
      isRead: true,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      labels: ['design', 'feedback']
    },
    {
      id: '3',
      subject: 'Weekly Newsletter - Tech Updates',
      sender: {
        name: 'TechCrunch',
        email: 'newsletter@techcrunch.com'
      },
      preview: 'This week in tech: AI breakthroughs, startup funding rounds, and the latest in cryptocurrency trends...',
      isRead: false,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      labels: ['newsletter', 'tech']
    },
    {
      id: '4',
      subject: 'Invoice #12345 - Payment Due',
      sender: {
        name: 'Accounting Team',
        email: 'accounting@company.com'
      },
      preview: 'Your monthly subscription invoice is ready. Payment is due within 30 days. Please review the attached invoice...',
      isRead: true,
      isStarred: false,
      isImportant: true,
      hasAttachments: true,
      receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      labels: ['billing', 'important']
    },
    {
      id: '5',
      subject: 'Coffee Chat - Let\'s Connect!',
      sender: {
        name: 'Alex Rodriguez',
        email: 'alex.rodriguez@company.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face'
      },
      preview: 'Hi! I\'d love to grab coffee sometime this week and chat about the new project. Are you free on Wednesday afternoon?',
      isRead: false,
      isStarred: false,
      isImportant: false,
      hasAttachments: false,
      receivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      labels: ['personal', 'coffee']
    }
  ]);

  const filteredEmails = emails.filter(email => 
    searchQuery === '' || 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmailClick = (emailId: string) => {
    onEmailSelect(emailId);
  };

  const handleStarToggle = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement star toggle
    console.log('Toggle star for email:', emailId);
  };

  const handleEmailAction = (action: string, emailId: string) => {
    // TODO: Implement email actions
    console.log('Email action:', action, 'for email:', emailId);
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
                    {email.sender.avatar ? (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={email.sender.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-medium text-sm">
                          {email.sender.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {email.sender.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          !email.isRead ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {email.sender.name}
                        </h4>
                        {email.isImportant && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            !
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(email.receivedAt, { addSuffix: true })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleStarToggle(email.id, e)}
                          className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          {email.isStarred ? (
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
                      !email.isRead ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {email.subject}
                    </h5>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                      {email.preview}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {email.hasAttachments && (
                          <Paperclip className="w-3 h-3 text-slate-400" />
                        )}
                        {email.labels.map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                      {!email.isRead && (
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmailList;
