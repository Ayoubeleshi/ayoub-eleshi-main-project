import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { useSendMessage, useSetTypingIndicator, useFileUpload } from '../../hooks/useChat';
import { Send, Paperclip, Smile, Search, Upload, X } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import FileUpload from './FileUpload';
import MessageSearch from './MessageSearch';
import { useToast } from '../ui/use-toast';

interface MessageInputProps {
  channelId?: string;
  recipientId?: string;
  parentMessageId?: string;
  placeholder?: string;
  className?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  channelId,
  recipientId,
  parentMessageId,
  placeholder = "Type a message...",
  className = ""
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { mutate: setTypingIndicator } = useSetTypingIndicator();
  const { uploadFile, uploadProgress, isUploading } = useFileUpload();
  const { toast } = useToast();

  // Handle typing indicator
  useEffect(() => {
    if (channelId) {
      setTypingIndicator({ channelId, isTyping });
    }
  }, [isTyping, channelId, setTypingIndicator]);

  const handleSubmit = async (content: string) => {
    if (!content.trim() || isPending) return;

    try {
      let fileUrl = uploadedFileUrl;

      // Upload file if selected
      if (selectedFile && !uploadedFileUrl) {
        fileUrl = await uploadFile(selectedFile, channelId, recipientId);
      }

      // Determine message type
      const hasFileReference = content.includes('📎 [') && content.includes(']');
      const messageType = (fileUrl || hasFileReference) ? 'file' : 'text';

      sendMessage({
        content: content.trim(),
        channelId,
        recipientId,
        messageType,
        fileUrl,
        parentMessageId,
      });

      setMessage('');
      setIsTyping(false);
      setSelectedFile(null);
      setUploadedFileUrl(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setShowFileUpload(false);
    
    try {
      const fileUrl = await uploadFile(file, channelId, recipientId);
      setUploadedFileUrl(fileUrl);
      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      setSelectedFile(null);
    }
  };

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
  };

  return (
    <div className="px-4 py-2">
      {/* File Upload Progress */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Uploading file... {Math.round(uploadProgress)}%</span>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
          <span>📎 {selectedFile.name}</span>
          {uploadedFileUrl && <span className="text-green-500">✓ Uploaded</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedFile(null);
              setUploadedFileUrl(null);
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <FileUpload
          onFileSelect={handleFileSelect}
          maxSize={10}
          className="border rounded-lg p-4 mb-2"
        />
      )}

      {/* Rich Text Editor */}
      <RichTextEditor
        onSend={handleSubmit}
        onTyping={handleTyping}
        onFileSelect={handleFileSelect}
        placeholder={placeholder}
        disabled={isPending}
      />

      {/* Message Search Modal */}
      {showSearch && (
        <MessageSearch
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;
