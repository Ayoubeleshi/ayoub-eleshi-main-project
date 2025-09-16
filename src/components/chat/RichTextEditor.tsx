import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bold, 
  Italic, 
  Smile,
  Paperclip,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if formatting is active
  const isFormatActive = (format: string) => {
    if (!editorRef.current) return false;
    
    switch (format) {
      case 'bold':
        return document.queryCommandState('bold');
      case 'italic':
        return document.queryCommandState('italic');
      default:
        return false;
    }
  };

  const formatActions: FormatAction[] = [
    {
      name: 'Bold',
      icon: <Bold className="w-4 h-4" />,
      action: () => {
        document.execCommand('bold');
        editorRef.current?.focus();
      },
      shortcut: 'Ctrl+B',
      isActive: isFormatActive('bold'),
    },
    {
      name: 'Italic',
      icon: <Italic className="w-4 h-4" />,
      action: () => {
        document.execCommand('italic');
        editorRef.current?.focus();
      },
      shortcut: 'Ctrl+I',
      isActive: isFormatActive('italic'),
    },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
      }
    }
    
    // Handle Enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    if (content.trim() === '' || content === '<br>') return;
    
    onSend(content);
    editorRef.current.innerHTML = '';
    editorRef.current.focus();
  };

  const handleInput = () => {
    if (onTyping) {
      onTyping(true);
      // Stop typing after 1 second of inactivity
      setTimeout(() => {
        if (onTyping) onTyping(false);
      }, 1000);
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleEmojiClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      document.execCommand('insertText', false, emoji);
      editorRef.current.focus();
    }
    setShowEmojiPicker(false);
  };

  // Emoji categories
  const emojiCategories = {
    'Smileys & People': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜'],
    'Animals & Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣'],
    'Food & Drink': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫒', '🌽'],
    'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊'],
    'Travel & Places': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️'],
    'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️'],
    'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️'],
  };

  const getPlainText = () => {
    if (!editorRef.current) return '';
    return editorRef.current.innerText || '';
  };

  const hasContent = () => {
    const text = getPlainText();
    return text.trim() !== '';
  };

  return (
    <div className={cn("chatbox-container", className)}>
      <div className="relative">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700">
          {formatActions.map((action) => (
            <TooltipProvider key={action.name}>
              <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action.action}
                    className={cn(
                      "h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700",
                      action.isActive && "bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100"
                    )}
                  >
                    {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                  <p>{action.name} {action.shortcut && `(${action.shortcut})`}</p>
              </TooltipContent>
            </Tooltip>
            </TooltipProvider>
          ))}
          
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
          
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEmojiClick}
                  className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                  <Smile className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add emoji</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFileClick}
                  className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                  <Paperclip className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Attach file</p>
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
        </div>

        {/* Editor */}
        <div className="flex items-end gap-2 p-3">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className="flex-1 min-h-[20px] max-h-[200px] overflow-y-auto text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none resize-none"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning={true}
          />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            <Button
              onClick={handleSend}
              disabled={!hasContent() || disabled}
              size="sm"
              className="h-6 w-6 p-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-3 h-3" />
            </Button>
          </motion.div>
        </div>

        {/* Emoji Picker Modal */}
        {showEmojiPicker && (
          <motion.div
            className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Choose an emoji</h3>
              <Button
                variant="ghost"
                size="sm"
                  onClick={() => setShowEmojiPicker(false)}
                  className="h-6 w-6 p-0"
              >
                  ×
              </Button>
        </div>

              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{category}</h4>
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.slice(0, 24).map((emoji, index) => (
              <Button 
                        key={`${category}-${index}`}
                        variant="ghost"
                size="sm" 
                        onClick={() => insertEmoji(emoji)}
                        className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 text-lg"
              >
                        {emoji}
              </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
        </div>

      {/* Placeholder styling */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable]:focus:before {
          content: none;
        }
      `}</style>
      </div>
  );
};

export default RichTextEditor;