import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  Users,
  TrendingUp,
  FileText,
  Building2,
  BarChart3
} from 'lucide-react';

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

interface FolderViewProps {
  folders: BusinessFolder[];
  files: FileItem[];
  onFolderSelect?: (folder: string | null) => void;
  selectedFolder?: string | null;
}

const FolderView: React.FC<FolderViewProps> = ({
  folders,
  files,
  onFolderSelect,
  selectedFolder,
}) => {
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

  const getFolderStats = (folderName: string) => {
    const folderFiles = getFilesInFolder(folderName);
    const totalSize = folderFiles.reduce((sum, file) => sum + file.file_size, 0);
    return {
      count: folderFiles.length,
      size: totalSize,
      recentFiles: folderFiles.slice(0, 3)
    };
  };

  return (
    <div className="space-y-6">
      {/* Folder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folders.map((folder) => {
          const stats = getFolderStats(folder.name);
          const isSelected = selectedFolder === folder.name.toLowerCase().replace(' ', '-');
          
          return (
            <div
              key={folder.name}
              className={`group relative bg-card border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20 ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onFolderSelect?.(
                isSelected ? null : folder.name.toLowerCase().replace(' ', '-')
              )}
            >
              {/* Folder Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${
                    folder.name === 'Human Resources' && "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800",
                    folder.name === 'Finance' && "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800",
                    folder.name === 'Legal' && "from-red-100 to-red-200 dark:from-red-900 dark:to-red-800",
                    folder.name === 'Marketing' && "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800",
                    folder.name === 'Operations' && "from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800",
                    folder.name === 'Projects' && "from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
                  } || "from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800"}`}>
                    <folder.icon className={`h-6 w-6 ${folder.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stats.count} {stats.count === 1 ? 'file' : 'files'}
                    </p>
                  </div>
                </div>
                <FolderOpen className={`h-5 w-5 ${folder.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
              </div>

              {/* Folder Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{stats.count}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Files</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-lg font-bold">{formatFileSize(stats.size)}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Size</p>
                </div>
              </div>

              {/* Recent Files Preview */}
              {stats.recentFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recent Files
                  </p>
                  {stats.recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="truncate flex-1">{file.name}</span>
                    </div>
                  ))}
                  {stats.count > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{stats.count - 3} more files
                    </p>
                  )}
                </div>
              )}

              {/* Empty State */}
              {stats.count === 0 && (
                <div className="text-center py-4">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No files yet</p>
                  <p className="text-xs text-muted-foreground">Upload files to get started</p>
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Folder Details */}
      {selectedFolder && (
        <div className="bg-card border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
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
          
          <div className="text-sm text-muted-foreground">
            {files.filter(file => 
              file.folder_path === selectedFolder || 
              (selectedFolder === 'general' && !file.folder_path)
            ).length} files in this folder
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderView;