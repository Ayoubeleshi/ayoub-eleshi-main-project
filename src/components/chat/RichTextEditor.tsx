import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Code, 
  Link, 
  List, 
  ListOrdered, 
  Quote,
  Smile,
  Paperclip,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  onSend: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onFileSelect?: (file: File) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface FormatAction {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  isActive?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  onSend,
  onTyping,
  onFileSelect,
  placeholder = "Type a message...",
  className = "",
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    setContent(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatActions: FormatAction[] = [
    {
      name: 'Bold',
      icon: <Bold className="w-4 h-4" />,
      action: () => insertText('**', '**'),
      shortcut: 'Ctrl+B',
    },
    {
      name: 'Italic',
      icon: <Italic className="w-4 h-4" />,
      action: () => insertText('*', '*'),
      shortcut: 'Ctrl+I',
    },
    {
      name: 'Code',
      icon: <Code className="w-4 h-4" />,
      action: () => insertText('`', '`'),
      shortcut: 'Ctrl+`',
    },
    {
      name: 'Code Block',
      icon: <Code className="w-4 h-4" />,
      action: () => insertText('```\n', '\n```'),
      shortcut: 'Ctrl+Shift+`',
    },
    {
      name: 'Quote',
      icon: <Quote className="w-4 h-4" />,
      action: () => insertText('> ', ''),
      shortcut: 'Ctrl+Q',
    },
    {
      name: 'Bullet List',
      icon: <List className="w-4 h-4" />,
      action: () => insertText('- ', ''),
      shortcut: 'Ctrl+L',
    },
    {
      name: 'Numbered List',
      icon: <ListOrdered className="w-4 h-4" />,
      action: () => insertText('1. ', ''),
      shortcut: 'Ctrl+Shift+L',
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertText('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*');
          break;
        case '`':
          e.preventDefault();
          if (e.shiftKey) {
            insertText('```\n', '\n```');
          } else {
            insertText('`', '`');
          }
          break;
        case 'q':
          e.preventDefault();
          insertText('> ', '');
          break;
        case 'l':
          e.preventDefault();
          if (e.shiftKey) {
            insertText('1. ', '');
          } else {
            insertText('- ', '');
          }
          break;
        case 'enter':
          e.preventDefault();
          handleSend();
          break;
      }
    }
    
    // Handle Enter to send (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent('');
      setShowLinkInput(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping?.(e.target.value.length > 0);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      insertText(`[${linkText}](${linkUrl})`);
      setShowLinkInput(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleEmojiClick = () => {
    // Simple emoji picker - you can expand this later
    const emojis = ['😊', '👍', '❤️', '🎉', '👏', '🔥', '😄', '🤔', '😍', '😂', '😭', '😱', '🤯', '💯', '✨', '🚀', '💪', '🎯', '💡', '🌟'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    insertText(`${randomEmoji} `);
  };

  const handleFileClick = () => {
    // Create a file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Use the actual file upload system
        if (onFileSelect) {
          onFileSelect(file);
        } else {
          // Fallback to text insertion
          insertText(`📎 [${file.name}] `);
        }
      }
    };
    input.click();
  };

  return (
    <TooltipProvider>
      <div className={cn("border rounded-lg bg-background", className)}>
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30">
          {formatActions.map((action) => (
            <Tooltip key={action.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action.action}
                  className="h-6 w-6 p-0 hover:bg-muted"
                  disabled={disabled}
                >
                  <span className="text-xs scale-75">{action.icon}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.name}</p>
                {action.shortcut && <p className="text-xs text-muted-foreground">{action.shortcut}</p>}
              </TooltipContent>
            </Tooltip>
          ))}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmojiClick}
                className="h-6 w-6 p-0 hover:bg-muted"
                disabled={disabled}
              >
                <Smile className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add emoji</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFileClick}
                className="h-6 w-6 p-0 hover:bg-muted"
                disabled={disabled}
              >
                <Paperclip className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Attach file</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkInput(!showLinkInput)}
                className={cn("h-6 w-6 p-0 hover:bg-muted", showLinkInput && "bg-muted")}
                disabled={disabled}
              >
                <Link className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert link</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Link Input */}
        {showLinkInput && (
          <div className="p-3 border-b bg-muted/20 space-y-2">
            <div className="flex gap-2">
              <Input
                ref={linkInputRef}
                placeholder="Link text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && insertLink()}
              />
              <Input
                placeholder="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && insertLink()}
              />
              <Button size="sm" onClick={insertLink} disabled={!linkUrl || !linkText}>
                Insert
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowLinkInput(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Text Area */}
        <div className="p-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full min-h-[60px] max-h-[120px] resize-none border-0 bg-transparent focus:outline-none focus:ring-0 text-sm"
            disabled={disabled}
          />
        </div>

        {/* Send Button */}
        <div className="flex items-center justify-between px-2 py-1 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Enter to send • Shift+Enter for new line
          </div>
          <Button
            onClick={handleSend}
            disabled={!content.trim() || disabled}
            size="sm"
            className="px-3 h-7 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="w-3 h-3 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default RichTextEditor;
