import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Star, 
  Download, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  File as FileIcon,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { format, formatDistanceToNow } from 'date-fns';

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

interface QuickAccessProps {
  files: FileItem[];
  onDownload?: (filePath: string, fileName: string) => void;
  showFavorites?: boolean;
}

const QuickAccess: React.FC<QuickAccessProps> = ({
  files,
  onDownload,
  showFavorites = false,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);

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

  const toggleFavorite = (fileId: string) => {
    setFavorites(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const recentFiles = files.slice(0, 8);
  const favoriteFiles = files.filter(file => favorites.includes(file.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Recent Files</span>
            <Badge variant="secondary">{recentFiles.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentFiles.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No recent files</p>
              <p className="text-sm text-muted-foreground">
                Files you've uploaded will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentFiles.map((file) => {
                const FileIcon = getFileIcon(file.file_type);
                const isFavorite = favorites.includes(file.id);
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(file.id)}
                        className={isFavorite ? 'text-yellow-500' : ''}
                      >
                        <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDownload?.(file.file_path, file.name)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorite Files */}
      {showFavorites && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Favorite Files</span>
              <Badge variant="secondary">{favoriteFiles.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favoriteFiles.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No favorite files</p>
                <p className="text-sm text-muted-foreground">
                  Click the star icon on files to add them here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteFiles.map((file) => {
                  const FileIcon = getFileIcon(file.file_type);
                  
                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-muted">
                          <FileIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>By {file.profiles.full_name}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(file.id)}
                          className="text-yellow-500"
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDownload?.(file.file_path, file.name)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {!showFavorites && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Documents</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {files.filter(f => f.file_type.includes('pdf') || f.file_type.includes('document')).length}
                  </p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/50">
                  <Image className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">Images</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {files.filter(f => f.file_type.startsWith('image/')).length}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Recent Activity</span>
                </div>
                <div className="space-y-2">
                  {files.slice(0, 3).map((file) => (
                    <div key={file.id} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="truncate flex-1">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickAccess;