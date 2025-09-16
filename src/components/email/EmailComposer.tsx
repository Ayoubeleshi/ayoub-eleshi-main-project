import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  X,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Smile,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EmailComposerProps {
  onBack: () => void;
  onSend: () => void;
  replyTo?: {
    subject: string;
    sender: string;
    body: string;
  };
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  onBack,
  onSend,
  replyTo
}) => {
  const [to, setTo] = useState(replyTo ? replyTo.sender : '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState(replyTo ? `\n\n---\n${replyTo.body}` : '');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.height = 'auto';
      bodyRef.current.style.height = `${bodyRef.current.scrollHeight}px`;
    }
  }, [body]);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      return;
    }

    setIsSending(true);
    
    try {
      // TODO: Implement actual email sending
      console.log('Sending email:', {
        to,
        cc,
        bcc,
        subject,
        body,
        attachments
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSend();
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const insertFormatting = (before: string, after: string = '') => {
    if (bodyRef.current) {
      const start = bodyRef.current.selectionStart;
      const end = bodyRef.current.selectionEnd;
      const selectedText = body.substring(start, end);
      
      const newText = body.substring(0, start) + before + selectedText + after + body.substring(end);
      setBody(newText);
      
      // Set cursor position
      setTimeout(() => {
        bodyRef.current?.focus();
        bodyRef.current?.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      }, 0);
    }
  };

  const isFormValid = to.trim() && subject.trim() && body.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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
                onClick={() => setShowCc(!showCc)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Cc
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Bcc
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
                  <DropdownMenuItem>
                    Save Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Discard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    Schedule Send
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Composer Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12">
                To:
              </label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipients"
                className="flex-1"
              />
            </div>
            
            {showCc && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12">
                  Cc:
                </label>
                <Input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Carbon copy"
                  className="flex-1"
                />
              </div>
            )}
            
            {showBcc && (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12">
                  Bcc:
                </label>
                <Input
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Blind carbon copy"
                  className="flex-1"
                />
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 w-12">
              Subject:
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1"
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Attachments:
              </label>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-1 p-2 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('**', '**')}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('*', '*')}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('[', '](url)')}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Link className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('- ', '')}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('1. ', '')}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertFormatting('> ', '')}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Quote className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <Textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Compose your email..."
              className="min-h-[300px] resize-none text-slate-900 dark:text-slate-100"
              style={{ minHeight: '300px' }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!isFormValid || isSending}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailComposer;
