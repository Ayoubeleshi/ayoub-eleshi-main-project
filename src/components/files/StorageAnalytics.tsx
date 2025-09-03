import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  HardDrive,
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Users,
  Calendar,
  Download
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';

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

interface StorageAnalyticsProps {
  files: FileItem[];
}

const StorageAnalytics: React.FC<StorageAnalyticsProps> = ({ files }) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate total storage used
  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
  const storageLimit = 10 * 1024 * 1024 * 1024; // 10GB limit for demo
  const usagePercentage = (totalSize / storageLimit) * 100;

  // File type analysis
  const fileTypeStats = {
    documents: files.filter(f => f.file_type.includes('pdf') || f.file_type.includes('document') || f.file_type.includes('text')),
    images: files.filter(f => f.file_type.startsWith('image/')),
    videos: files.filter(f => f.file_type.startsWith('video/')),
    audio: files.filter(f => f.file_type.startsWith('audio/')),
    archives: files.filter(f => f.file_type.includes('zip') || f.file_type.includes('archive')),
    others: files.filter(f => 
      !f.file_type.includes('pdf') && 
      !f.file_type.includes('document') && 
      !f.file_type.includes('text') &&
      !f.file_type.startsWith('image/') && 
      !f.file_type.startsWith('video/') && 
      !f.file_type.startsWith('audio/') && 
      !f.file_type.includes('zip') && 
      !f.file_type.includes('archive')
    )
  };

  // Department usage
  const departmentUsage = {
    'human-resources': files.filter(f => f.folder_path === 'human-resources'),
    'finance': files.filter(f => f.folder_path === 'finance'),
    'legal': files.filter(f => f.folder_path === 'legal'),
    'marketing': files.filter(f => f.folder_path === 'marketing'),
    'operations': files.filter(f => f.folder_path === 'operations'),
    'projects': files.filter(f => f.folder_path === 'projects'),
    'general': files.filter(f => !f.folder_path)
  };

  // Recent activity (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentFiles = files.filter(file => 
    isAfter(new Date(file.created_at), sevenDaysAgo)
  );

  // Top uploaders
  const uploaderStats = files.reduce((acc, file) => {
    const uploader = file.profiles.full_name;
    if (!acc[uploader]) {
      acc[uploader] = { count: 0, size: 0 };
    }
    acc[uploader].count++;
    acc[uploader].size += file.file_size;
    return acc;
  }, {} as Record<string, { count: number; size: number }>);

  const topUploaders = Object.entries(uploaderStats)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Storage</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatFileSize(totalSize)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {usagePercentage.toFixed(1)}% of 10GB used
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Total Files</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{files.length}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  +{recentFiles.length} this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Active Users</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {Object.keys(uploaderStats).length}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Contributing members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Avg File Size</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {files.length > 0 ? formatFileSize(totalSize / files.length) : '0 Bytes'}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Per document
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Storage Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Used Storage</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(totalSize)} / {formatFileSize(storageLimit)}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>File Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(fileTypeStats).map(([type, typeFiles]) => {
                const percentage = files.length > 0 ? (typeFiles.length / files.length) * 100 : 0;
                const totalSize = typeFiles.reduce((sum, file) => sum + file.file_size, 0);
                
                const getIcon = (type: string) => {
                  switch (type) {
                    case 'documents': return FileText;
                    case 'images': return Image;
                    case 'videos': return Video;
                    case 'audio': return Music;
                    case 'archives': return Archive;
                    default: return FileText;
                  }
                };

                const getColor = (type: string) => {
                  switch (type) {
                    case 'documents': return 'text-blue-600';
                    case 'images': return 'text-green-600';
                    case 'videos': return 'text-red-600';
                    case 'audio': return 'text-purple-600';
                    case 'archives': return 'text-orange-600';
                    default: return 'text-gray-600';
                  }
                };

                const TypeIcon = getIcon(type);
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className={`h-4 w-4 ${getColor(type)}`} />
                        <span className="font-medium capitalize">{type}</span>
                        <Badge variant="outline">{typeFiles.length}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(totalSize)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Department Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Department Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(departmentUsage).map(([dept, deptFiles]) => {
                const percentage = files.length > 0 ? (deptFiles.length / files.length) * 100 : 0;
                const totalSize = deptFiles.reduce((sum, file) => sum + file.file_size, 0);
                
                return (
                  <div key={dept} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium capitalize">
                          {dept.replace('-', ' ')}
                        </span>
                        <Badge variant="outline">{deptFiles.length}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(totalSize)}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Top Contributors</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topUploaders.map(([uploader, stats], index) => (
              <div key={uploader} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground text-sm font-medium">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{uploader}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.count} files • {formatFileSize(stats.size)}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {((stats.count / files.length) * 100).toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageAnalytics;