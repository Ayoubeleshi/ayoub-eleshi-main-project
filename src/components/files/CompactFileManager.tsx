import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  FolderOpen, 
  Plus,
  Grid3x3,
  List,
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Edit,
  Trash2,
  Download,
  Cloud,
  ExternalLink
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
import { useToast } from '@/hooks/use-toast';
import FileUploadModal from './FileUploadModal';
import FolderManagementModal from './FolderManagementModal';

interface FileItem {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  file_type: string;
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

export default function CompactFileManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'folder'>('folder');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) {
      fetchData();
      checkGoogleDriveConnection();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile?.organization_id) return;

    try {
      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
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
      setFiles(filesData || []);
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

  const checkGoogleDriveConnection = async () => {
    if (!profile?.id) return;
    
    try {
      const { data } = await supabase
        .from('google_integrations')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .single();
      
      setGoogleDriveConnected(!!data);
    } catch (error) {
      setGoogleDriveConnected(false);
    }
  };

  const connectGoogleDrive = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { 
          scope: ['https://www.googleapis.com/auth/drive.readonly'],
          profile_id: profile?.id 
        }
      });

      if (error) throw error;

      if (data?.auth_url) {
        window.open(data.auth_url, '_blank');
        toast({
          title: "Google Drive",
          description: "Opening Google Drive authorization window...",
        });
      }
    } catch (error) {
      console.error('Error connecting Google Drive:', error);
      toast({
        title: "Error",
        description: "Failed to connect Google Drive",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    try {
      const { error } = await supabase
        .from('files')
        .update({ 
          folder_id: destination.droppableId === 'unassigned' ? null : destination.droppableId
        })
        .eq('id', draggableId);

      if (error) throw error;

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

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
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
      FolderOpen, FileText, Image, Video, Music, Archive
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

  const mapFoldersForUpload = (folders: Folder[]) => {
    return folders.map(f => ({
      id: f.id,
      name: f.name,
      icon: getIconComponent(f.icon),
      color: f.color
    }));
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !selectedFolder || file.folder_id === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const unassignedFiles = files.filter(file => !file.folder_id);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col bg-background">
        {/* Compact Header */}
        <div className="flex-shrink-0 border-b bg-card/50 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">Files & Folders</h1>
            <div className="flex items-center gap-2">
              {/* Google Drive Status */}
              <Button
                variant={googleDriveConnected ? "outline" : "ghost"}
                size="sm"
                onClick={connectGoogleDrive}
                className="gap-2 text-xs"
              >
                <Cloud className="h-3 w-3" />
                {googleDriveConnected ? "Drive Connected" : "Connect Drive"}
              </Button>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-md p-0.5">
                <Button
                  variant={viewMode === 'folder' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('folder')}
                  className="h-7 px-2"
                >
                  <FolderOpen className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-7 px-2"
                >
                  <Grid3x3 className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-7 px-2"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
              
              <Button 
                onClick={() => setShowFolderModal(true)} 
                variant="outline" 
                size="sm"
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Folder
              </Button>
              <Button 
                onClick={() => setShowUploadModal(true)} 
                size="sm"
                className="gap-1"
              >
                <Upload className="h-3 w-3" />
                Upload
              </Button>
            </div>
          </div>

          {/* Compact Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="h-full flex flex-col">
            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="folder" className="h-full m-0">
                <div className="space-y-4">
                  {/* Folders Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {folders.map((folder) => {
                      const folderFiles = files.filter(f => f.folder_id === folder.id);
                      const IconComponent = getIconComponent(folder.icon);
                      
                      return (
                        <Droppable key={folder.id} droppableId={folder.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`group relative bg-card border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/30 ${
                                snapshot.isDraggingOver ? 'border-primary bg-primary/5' : ''
                              } ${selectedFolder === folder.id ? 'ring-2 ring-primary/50' : ''}`}
                              onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-md bg-gradient-to-br ${
                                  folder.color === 'text-blue-600' ? 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800' :
                                  folder.color === 'text-green-600' ? 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800' :
                                  folder.color === 'text-red-600' ? 'from-red-100 to-red-200 dark:from-red-900 dark:to-red-800' :
                                  folder.color === 'text-purple-600' ? 'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800' :
                                  'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
                                }`}>
                                  <IconComponent className={`h-4 w-4 ${folder.color}`} />
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
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
                                      <Edit className="mr-2 h-3 w-3" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFolder(folder.id);
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-3 w-3" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              <div>
                                <p className="font-medium text-sm truncate">{folder.name}</p>
                                <p className="text-xs text-muted-foreground">{folderFiles.length} files</p>
                              </div>
                              
                              {folder.tags && folder.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {folder.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {folder.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                      +{folder.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      );
                    })}
                  </div>

                  {/* Files in Selected Folder */}
                  {selectedFolder && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Files in folder</h3>
                      <div className="grid grid-cols-1 gap-1">
                        {filteredFiles.map((file, index) => (
                          <Draggable key={file.id} draggableId={file.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex items-center gap-2 p-2 bg-card border rounded hover:bg-accent/50 transition-colors"
                              >
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unassigned Files */}
                  {!selectedFolder && unassignedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Unassigned Files</h3>
                      <Droppable droppableId="unassigned">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-1"
                          >
                            {unassignedFiles.map((file, index) => (
                              <Draggable key={file.id} draggableId={file.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-2 p-2 bg-card border rounded hover:bg-accent/50 transition-colors"
                                  >
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{file.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.file_size)} • {new Date(file.created_at).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="grid" className="h-full m-0">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="group bg-card border rounded-lg p-2 hover:shadow-md transition-all">
                      <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-xs font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="list" className="h-full m-0">
                <div className="space-y-1">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-2 bg-card border rounded hover:bg-accent/50 transition-colors">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(file.created_at).toLocaleDateString()}</p>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Modals */}
        <FileUploadModal
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          folders={mapFoldersForUpload(folders)}
          onUploadComplete={fetchData}
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