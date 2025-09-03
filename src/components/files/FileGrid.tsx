import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  File as FileIcon,
  Download,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

interface FileItem {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface FileGridProps {
  files: FileItem[];
  onDownload?: (filePath: string, fileName: string) => void;
}

const FileGrid: React.FC<FileGridProps> = ({ files, onDownload }) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    if (fileType.includes('zip') || fileType.includes('archive')) return Archive;
    return FileIcon;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (fileType.startsWith('video/')) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    if (fileType.startsWith('audio/')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (fileType.includes('pdf')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    if (fileType.includes('document')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map((file) => {
        const FileIcon = getFileIcon(file.file_type);
        
        return (
          <div
            key={file.id}
            className="group relative bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20"
          >
            {/* File Icon and Type Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg ${getFileTypeColor(file.file_type)}`}>
                <FileIcon className="h-6 w-6" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload?.(file.file_path, file.name)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* File Name */}
            <div className="mb-2">
              <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                {file.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.file_size)}
              </p>
            </div>

            {/* File Type Badge */}
            <div className="mb-2">
              <Badge variant="secondary" className="text-xs">
                {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
              </Badge>
            </div>

            {/* File Metadata */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                By {file.profiles.full_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(file.created_at), 'MMM d, yyyy')}
              </p>
            </div>

            {/* Quick Download Button (appears on hover) */}
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-4 right-4 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDownload?.(file.file_path, file.name)}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default FileGrid;