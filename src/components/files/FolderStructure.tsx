import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Download,
  MoreHorizontal,
  File
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FileItem {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  folder_path: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface BusinessFolder {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface FolderStructureProps {
  folders: BusinessFolder[];
  files?: FileItem[];
  viewMode?: 'grid' | 'list';
  onFolderSelect?: (folder: string | null) => void;
  selectedFolder?: string | null;
  onDownload?: (filePath: string, fileName: string) => void;
}

const FolderStructure: React.FC<FolderStructureProps> = ({
  folders,
  files = [],
  viewMode = 'grid',
  onFolderSelect,
  selectedFolder,
  onDownload,
}) => {
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    if (fileType.includes('zip') || fileType.includes('archive')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFilesInFolder = (folderName: string) => {
    return files.filter(file => 
      file.folder_path === folderName.toLowerCase().replace(' ', '-') || 
      (folderName === 'General' && !file.folder_path)
    );
  };

  if (viewMode === 'list' && files.length > 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-left py-3 px-4 font-medium">Modified</th>
                  <th className="text-left py-3 px-4 font-medium">Owner</th>
                  <th className="text-left py-3 px-4 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.file_type);
                  return (
                    <tr key={file.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <FileIcon className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium truncate max-w-xs">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {format(new Date(file.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {file.profiles.full_name}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => onDownload?.(file.file_path, file.name)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Folders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => {
          const folderFiles = getFilesInFolder(folder.name);
          const isSelected = selectedFolder === folder.name.toLowerCase().replace(' ', '-');
          
          return (
            <Card 
              key={folder.name}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-md" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onFolderSelect?.(
                isSelected ? null : folder.name.toLowerCase().replace(' ', '-')
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-3 rounded-lg bg-gradient-to-br",
                      folder.name === 'Human Resources' && "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
                      folder.name === 'Finance' && "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
                      folder.name === 'Legal' && "from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
                      folder.name === 'Marketing' && "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
                      folder.name === 'Operations' && "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
                      folder.name === 'Projects' && "from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900"
                    )}>
                      <folder.icon className={cn("h-6 w-6", folder.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{folder.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'}
                      </p>
                    </div>
                  </div>
                  <FolderOpen className={cn("h-5 w-5", folder.color)} />
                </div>
                
                {folderFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recent Files
                    </div>
                    {folderFiles.slice(0, 3).map((file) => {
                      const FileIcon = getFileIcon(file.file_type);
                      return (
                        <div 
                          key={file.id}
                          className="flex items-center space-x-2 text-sm p-2 rounded hover:bg-muted/50 transition-colors"
                        >
                          <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate flex-1">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </span>
                        </div>
                      );
                    })}
                    {folderFiles.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{folderFiles.length - 3} more files
                      </div>
                    )}
                  </div>
                )}
                
                {folderFiles.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files yet</p>
                    <p className="text-xs">Upload documents to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Folder Files */}
      {selectedFolder && files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">
                {folders.find(f => f.name.toLowerCase().replace(' ', '-') === selectedFolder)?.name} Files
              </h3>
              <Button 
                variant="outline" 
                onClick={() => onFolderSelect?.(null)}
              >
                Back to All Folders
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files
                .filter(file => 
                  file.folder_path === selectedFolder || 
                  (selectedFolder === 'general' && !file.folder_path)
                )
                .map((file) => {
                  const FileIcon = getFileIcon(file.file_type);
                  return (
                    <Card key={file.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-muted">
                              <FileIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{file.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.file_size)}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => onDownload?.(file.file_path, file.name)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Uploaded by {file.profiles.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {file.file_type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(file.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FolderStructure;