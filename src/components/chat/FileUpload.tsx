import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Video, Music, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

interface FilePreview {
  file: File;
  preview?: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  maxSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*'],
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const { toast } = useToast();

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="w-8 h-8 text-purple-500" />;
    if (file.type.startsWith('audio/')) return <Music className="w-8 h-8 text-green-500" />;
    if (file.type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
    if (file.type.includes('zip') || file.type.includes('rar')) return <Archive className="w-8 h-8 text-orange-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });
    
    if (!isAccepted) {
      return 'File type not accepted';
    }
    
    return null;
  };

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: FilePreview[] = [];
    
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'File Error',
          description: `${file.name}: ${error}`,
          variant: 'destructive',
        });
        return;
      }
      
      const preview: FilePreview = {
        file,
        progress: 0,
        status: 'uploading',
      };
      
      // Generate preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.preview = e.target?.result as string;
          setSelectedFiles(prev => [...prev]);
        };
        reader.readAsDataURL(file);
      }
      
      validFiles.push(preview);
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Simulate upload progress
    validFiles.forEach((filePreview, index) => {
      const interval = setInterval(() => {
        setSelectedFiles(prev => 
          prev.map((f, i) => 
            f.file === filePreview.file 
              ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 100) }
              : f
          )
        );
        
        if (filePreview.progress >= 100) {
          clearInterval(interval);
          setSelectedFiles(prev => 
            prev.map(f => 
              f.file === filePreview.file 
                ? { ...f, status: 'success' as const }
                : f
            )
          );
          
          // Call onFileSelect when upload is complete
          setTimeout(() => {
            onFileSelect(filePreview.file);
          }, 500);
        }
      }, 100);
    });
  }, [maxSize, acceptedTypes, onFileSelect, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const removeFile = (file: File) => {
    setSelectedFiles(prev => prev.filter(f => f.file !== file));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Max file size: {maxSize}MB • Supported: Images, PDFs, Documents, Videos, Audio
        </p>
        <Button
          variant="outline"
          onClick={() => document.getElementById('file-input')?.click()}
          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Choose Files
        </Button>
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">
            Selected Files ({selectedFiles.length})
          </h4>
          {selectedFiles.map((filePreview, index) => (
            <div
              key={`${filePreview.file.name}-${index}`}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {filePreview.preview ? (
                <img
                  src={filePreview.preview}
                  alt={filePreview.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center">
                  {getFileIcon(filePreview.file)}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {filePreview.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(filePreview.file.size)}
                </p>
                {filePreview.status === 'uploading' && (
                  <Progress value={filePreview.progress} className="h-1 mt-1" />
                )}
                {filePreview.status === 'success' && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Upload complete
                  </p>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(filePreview.file)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
