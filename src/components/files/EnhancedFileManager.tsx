import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  FolderOpen, 
  Plus,
  BarChart3,
  Clock,
  Star,
  Filter,
  Grid3x3,
  List,
  Download,
  MoreHorizontal,
  Building2,
  Users,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  TrendingUp,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import FileUploadModal from './FileUploadModal';
import FileGrid from './FileGrid';
import FileTable from './FileTable';
import EmptyState from './EmptyState';
import FolderManagementModal from './FolderManagementModal';

interface FileItem {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  folder_path: string | null;
  folder_id: string | null;
  tags: string[] | null;
  created_at: string;
  uploaded_by: string;
  profiles: {
    full_name: string;
  };
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  tags: string[];
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function EnhancedFileManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'folder'>('folder');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (profile?.organization_id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile?.organization_id) return;

    try {
      // Fetch folders
      const { data: foldersData, error: foldersError } = await (supabase as any)
        .from('folders')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (foldersError) throw foldersError;

      // Fetch files
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select(`
          *,
          profiles:uploaded_by(full_name)
        `)
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (filesError) throw filesError;
      
      setFolders(foldersData || []);
      
      const mappedFiles = (filesData || []).map(file => ({
        ...file,
        folder_path: (file as any).folder_path || null,
        folder_id: (file as any).folder_id || null,
        tags: (file as any).tags || null
      }));
      
      setFiles(mappedFiles);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same place, do nothing
    if (source.droppableId === destination.droppableId) return;

    try {
      // Update file's folder
      const { error } = await (supabase as any)
        .from('files')
        .update({ 
          folder_id: destination.droppableId === 'unassigned' ? null : destination.droppableId,
          folder_path: destination.droppableId === 'unassigned' ? null : 
            folders.find(f => f.id === destination.droppableId)?.name.toLowerCase().replace(' ', '-')
        })
        .eq('id', draggableId);

      if (error) throw error;

      // Refresh data
      fetchData();

      toast({
        title: "Success",
        description: "File moved successfully",
      });
    } catch (error) {
      console.error('Error moving file:', error);
      toast({
        title: "Error",
        description: "Failed to move file",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('chat-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      fetchData();
      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      FolderOpen,
      Users,
      Building2,
      BarChart3,
      TrendingUp,
      FileText
    };
    return icons[iconName] || FolderOpen;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || file.folder_id === selectedFolder;
    const matchesType = filterType === 'all' || file.file_type.startsWith(filterType);
    return matchesSearch && matchesFolder && matchesType;
  });

  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0);
  const recentFiles = files.slice(0, 10);
  const unassignedFiles = files.filter(file => !file.folder_id);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your business documents...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Files & Folders</h1>
                <p className="text-sm text-muted-foreground">
                  Organize and manage your business documents
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'folder' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('folder')}
                    className="h-8 px-3"
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-3"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={() => setShowFolderModal(true)} 
                  variant="outline" 
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Folder
                </Button>
                <Button onClick={() => setShowUploadModal(true)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {filterType === 'all' ? 'All files' : filterType}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterType('all')}>
                    All files
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterType('image')}>
                    <Image className="mr-2 h-4 w-4" />
                    Images
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('application')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterType('video')}>
                    <Video className="mr-2 h-4 w-4" />
                    Videos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-primary/5 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{files.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Storage Used</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatFileSize(totalSize)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Folders</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{folders.length}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Recent</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{recentFiles.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'folder' ? (
            <div className="space-y-6">
              {/* Folders Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Folders</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFolderModal(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Folder
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map((folder) => {
                    const folderFiles = files.filter(f => f.folder_id === folder.id);
                    const IconComponent = getIconComponent(folder.icon);
                    
                    return (
                      <Droppable key={folder.id} droppableId={folder.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`group relative bg-card border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/20 ${
                              snapshot.isDraggingOver ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`p-3 rounded-lg bg-gradient-to-br ${
                                folder.color === 'text-blue-600' && "from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800"
                              } ${
                                folder.color === 'text-green-600' && "from-green-100 to-green-200 dark:from-green-900 dark:to-green-800"
                              } ${
                                folder.color === 'text-red-600' && "from-red-100 to-red-200 dark:from-red-900 dark:to-red-800"
                              } ${
                                folder.color === 'text-purple-600' && "from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800"
                              } ${
                                folder.color === 'text-orange-600' && "from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800"
                              } ${
                                folder.color === 'text-indigo-600' && "from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
                              }`}>
                                <IconComponent className={`h-6 w-6 ${folder.color}`} />
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingFolder(folder);
                                      setShowFolderModal(true);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteFolder(folder.id);
                                    }}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="space-y-2">
                              <h3 className="font-semibold text-base">{folder.name}</h3>
                              {folder.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {folder.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'}
                                </span>
                                {folder.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {folder.tags.slice(0, 2).map((tag) => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {folder.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{folder.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              </div>

              {/* Unassigned Files */}
              {unassignedFiles.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Unorganized Files</h2>
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`border-2 border-dashed rounded-lg p-4 ${
                          snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-muted'
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {unassignedFiles.map((file, index) => (
                            <Draggable key={file.id} draggableId={file.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-card border rounded-lg p-3 hover:shadow-md transition-shadow"
                                >
                                  <div className="text-sm font-medium truncate">{file.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatFileSize(file.file_size)}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}

              {/* Selected Folder Files */}
              {selectedFolder && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {folders.find(f => f.id === selectedFolder)?.name} Files
                    </h2>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedFolder(null)}
                    >
                      Back to All Folders
                    </Button>
                  </div>
                  <FileGrid files={filteredFiles} onDownload={downloadFile} />
                </div>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            filteredFiles.length > 0 ? (
              <FileGrid files={filteredFiles} onDownload={downloadFile} />
            ) : (
              <EmptyState />
            )
          ) : (
            <FileTable files={filteredFiles} onDownload={downloadFile} />
          )}
        </div>

        {/* Modals */}
        <FileUploadModal
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          onUploadComplete={() => {
            fetchData();
            setShowUploadModal(false);
          }}
          folders={folders.map(folder => ({
            name: folder.name,
            icon: getIconComponent(folder.icon),
            color: folder.color
          }))}
        />

        <FolderManagementModal
          open={showFolderModal}
          onOpenChange={(open) => {
            setShowFolderModal(open);
            if (!open) setEditingFolder(null);
          }}
          folder={editingFolder}
          onSaved={fetchData}
        />
      </div>
    </DragDropContext>
  );
}