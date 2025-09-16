import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Star, 
  StarOff,
  MoreHorizontal,
  Download,
  Printer,
  Flag,
  FlagOff,
  Paperclip,
  Clock,
  User
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
import { formatDistanceToNow, format } from 'date-fns';

interface EmailAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  downloadUrl: string;
}

interface Email {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  recipients: {
    to: string[];
    cc?: string[];
    bcc?: string[];
  };
  body: string;
  bodyText: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  hasAttachments: boolean;
  attachments: EmailAttachment[];
  receivedAt: Date;
  labels: string[];
}

interface EmailViewerProps {
  emailId: string;
  onBack: () => void;
  onReply?: (emailId: string) => void;
  onForward?: (emailId: string) => void;
}

const EmailViewer: React.FC<EmailViewerProps> = ({
  emailId,
  onBack,
  onReply,
  onForward,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isImportant, setIsImportant] = useState(false);

  // Mock data - will be replaced with real data from hooks
  const email: Email = {
    id: emailId,
    subject: 'Meeting Tomorrow - Project Update',
    sender: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face'
    },
    recipients: {
      to: ['john.doe@company.com'],
      cc: ['team@company.com'],
      bcc: []
    },
    body: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
        <p>Hey team,</p>
        
        <p>Just wanted to confirm our meeting tomorrow at 2pm. We'll be discussing the Q4 roadmap and budget allocation for the upcoming projects.</p>
        
        <p>Please come prepared with:</p>
        <ul>
          <li>Your department's Q3 performance metrics</li>
          <li>Proposed Q4 initiatives and resource requirements</li>
          <li>Any blockers or challenges you're facing</li>
        </ul>
        
        <p>I've attached the preliminary budget spreadsheet for your review. Let me know if you have any questions before the meeting.</p>
        
        <p>Looking forward to seeing everyone there!</p>
        
        <p>Best regards,<br>
        Sarah Johnson<br>
        Project Manager</p>
      </div>
    `,
    bodyText: `Hey team,

Just wanted to confirm our meeting tomorrow at 2pm. We'll be discussing the Q4 roadmap and budget allocation for the upcoming projects.

Please come prepared with:
- Your department's Q3 performance metrics
- Proposed Q4 initiatives and resource requirements
- Any blockers or challenges you're facing

I've attached the preliminary budget spreadsheet for your review. Let me know if you have any questions before the meeting.

Looking forward to seeing everyone there!

Best regards,
Sarah Johnson
Project Manager`,
    isRead: true,
    isStarred: isStarred,
    isImportant: isImportant,
    hasAttachments: true,
    attachments: [
      {
        id: '1',
        filename: 'Q4_Budget_Allocation.xlsx',
        size: 245760,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        downloadUrl: '#'
      },
      {
        id: '2',
        filename: 'Meeting_Agenda.pdf',
        size: 156789,
        mimeType: 'application/pdf',
        downloadUrl: '#'
      }
    ],
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    labels: ['work', 'meeting']
  };

  const handleStarToggle = () => {
    setIsStarred(!isStarred);
  };

  const handleImportantToggle = () => {
    setIsImportant(!isImportant);
  };

  const handleEmailAction = (action: string) => {
    console.log('Email action:', action, 'for email:', emailId);
    switch (action) {
      case 'reply':
        onReply?.(emailId);
        break;
      case 'forward':
        onForward?.(emailId);
        break;
      default:
        break;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="h-full bg-white dark:bg-slate-800 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStarToggle}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {isStarred ? (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="w-4 h-4 text-slate-400" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImportantToggle}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {isImportant ? (
                  <Flag className="w-4 h-4 text-red-500 fill-current" />
                ) : (
                  <FlagOff className="w-4 h-4 text-slate-400" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => handleEmailAction('reply')}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEmailAction('forward')}>
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Printer className="w-4 h-4 mr-2" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {email.subject}
          </h1>
          
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{format(email.receivedAt, 'MMM d, yyyy \'at\' h:mm a')}</span>
            </div>
            <div className="flex items-center space-x-2">
              {email.labels.map((label) => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Sender Info */}
          <div className="flex items-start space-x-3 mb-6">
            <Avatar className="w-12 h-12">
              <AvatarImage src={email.sender.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white font-medium">
                {email.sender.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {email.sender.name}
                </h3>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  &lt;{email.sender.email}&gt;
                </span>
              </div>
              
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <div className="mb-1">
                  <span className="font-medium">To:</span> {email.recipients.to.join(', ')}
                </div>
                {email.recipients.cc && email.recipients.cc.length > 0 && (
                  <div className="mb-1">
                    <span className="font-medium">Cc:</span> {email.recipients.cc.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center">
                <Paperclip className="w-4 h-4 mr-2" />
                Attachments ({email.attachments.length})
              </h4>
              <div className="space-y-2">
                {email.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded flex items-center justify-center">
                        <Paperclip className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: email.body }}
              className="text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleEmailAction('reply')}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </Button>
          
          <Button
            onClick={() => handleEmailAction('forward')}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Forward className="w-4 h-4" />
            <span>Forward</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailViewer;
