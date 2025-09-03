import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  File as FileIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface BusinessFolder {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
  folders: BusinessFolder[];
}

interface UploadFile {
  file: File;
  id: string;
  folder?: string;
  tags: string[];
  description?: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  open,
  onOpenChange,
  onUploadComplete,
  folders,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files: File[]) => {
    const newUploadFiles: UploadFile[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      tags: [],
      status: 'pending',
      progress: 0,
    }));
    
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => 
      prev.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  };

  const addTag = (id: string, tag: string) => {
    if (!tag.trim()) return;
    updateFile(id, {
      tags: [...(uploadFiles.find(f => f.id === id)?.tags || []), tag.trim()]
    });
  };

  const removeTag = (id: string, tagIndex: number) => {
    const file = uploadFiles.find(f => f.id === id);
    if (file) {
      updateFile(id, {
        tags: file.tags.filter((_, index) => index !== tagIndex)
      });
    }
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    if (!profile?.organization_id) return;

    updateFile(uploadFile.id, { status: 'uploading', progress: 0 });

    try {
      // Generate file path
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${Date.now()}-${uploadFile.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const folderPath = uploadFile.folder ? `${uploadFile.folder}/` : '';
      const filePath = `${profile.organization_id}/${folderPath}${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, uploadFile.file);

      if (uploadError) throw uploadError;

      updateFile(uploadFile.id, { progress: 70 });

      // Save file metadata
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          organization_id: profile.organization_id,
          name: uploadFile.file.name,
          file_path: filePath,
          file_size: uploadFile.file.size,
          file_type: uploadFile.file.type,
          folder_path: uploadFile.folder,
          tags: uploadFile.tags.length > 0 ? uploadFile.tags : null,
          description: uploadFile.description,
          uploaded_by: profile.id
        });

      if (dbError) throw dbError;

      updateFile(uploadFile.id, { 
        status: 'complete', 
        progress: 100 
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      updateFile(uploadFile.id, { 
        status: 'error', 
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    
    try {
      await Promise.all(pendingFiles.map(uploadFile));
      
      const successCount = uploadFiles.filter(f => f.status === 'complete').length;
      const errorCount = uploadFiles.filter(f => f.status === 'error').length;
      
      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        });
      }
      
      if (errorCount === 0) {
        onUploadComplete();
        handleClose();
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Some files failed to upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setUploadFiles([]);
    setIsUploading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Business Documents</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Upload Area */}
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Support for PDF, DOC, XLS, PPT, images, and more
              </p>
              <Input
                type="file"
                multiple
                onChange={handleFileInput}
                disabled={isUploading}
                className="cursor-pointer"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.zip,.rar"
              />
            </div>
          </div>

          {/* Upload Queue */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Files to Upload ({uploadFiles.length})
                </h3>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadFiles([])}
                    disabled={isUploading}
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={handleUploadAll}
                    disabled={isUploading || uploadFiles.every(f => f.status !== 'pending')}
                  >
                    {isUploading ? 'Uploading...' : 'Upload All Files'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-auto">
                {uploadFiles.map((uploadFile) => {
                  const FileIcon = getFileIcon(uploadFile.file.type);
                  
                  return (
                    <div
                      key={uploadFile.id}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 rounded-lg bg-muted">
                            <FileIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{uploadFile.file.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(uploadFile.file.size)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {uploadFile.status === 'complete' && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                          {uploadFile.status === 'error' && (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(uploadFile.id)}
                            disabled={uploadFile.status === 'uploading'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {uploadFile.status === 'uploading' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{uploadFile.progress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {uploadFile.status === 'error' && uploadFile.error && (
                        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/50 p-2 rounded">
                          Error: {uploadFile.error}
                        </div>
                      )}

                      {uploadFile.status === 'pending' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Department</Label>
                            <Select
                              onValueChange={(value) => 
                                updateFile(uploadFile.id, { folder: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                {folders.map((folder) => (
                                  <SelectItem 
                                    key={folder.name} 
                                    value={folder.name.toLowerCase().replace(' ', '-')}
                                  >
                                    {folder.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Description (Optional)</Label>
                            <Input
                              placeholder="Brief description..."
                              onChange={(e) => 
                                updateFile(uploadFile.id, { description: e.target.value })
                              }
                            />
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {uploadFile.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeTag(uploadFile.id, index)}
                                >
                                  {tag}
                                  <X className="ml-1 h-3 w-3" />
                                </Badge>
                              ))}
                            </div>
                            <Input
                              placeholder="Add tags (press Enter)"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag(uploadFile.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;