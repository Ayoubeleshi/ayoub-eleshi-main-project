import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Tag, FolderOpen } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Folder {
  id?: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  tags: string[];
  organization_id?: string;
  created_by?: string;
}

interface FolderManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: Folder | null;
  onSaved: () => void;
}

const availableColors = [
  { name: 'Blue', value: 'text-blue-600', bg: 'from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800' },
  { name: 'Green', value: 'text-green-600', bg: 'from-green-100 to-green-200 dark:from-green-900 dark:to-green-800' },
  { name: 'Red', value: 'text-red-600', bg: 'from-red-100 to-red-200 dark:from-red-900 dark:to-red-800' },
  { name: 'Purple', value: 'text-purple-600', bg: 'from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800' },
  { name: 'Orange', value: 'text-orange-600', bg: 'from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800' },
  { name: 'Indigo', value: 'text-indigo-600', bg: 'from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800' },
];

const availableIcons = [
  { name: 'Folder', value: 'FolderOpen' },
  { name: 'Users', value: 'Users' },
  { name: 'Building', value: 'Building2' },
  { name: 'Chart', value: 'BarChart3' },
  { name: 'Trending', value: 'TrendingUp' },
  { name: 'File', value: 'FileText' },
];

const FolderManagementModal: React.FC<FolderManagementModalProps> = ({
  open,
  onOpenChange,
  folder,
  onSaved
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Folder>({
    name: '',
    description: '',
    color: 'text-blue-600',
    icon: 'FolderOpen',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (folder) {
      setFormData(folder);
    } else {
      setFormData({
        name: '',
        description: '',
        color: 'text-blue-600',
        icon: 'FolderOpen',
        tags: []
      });
    }
  }, [folder, open]);

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.organization_id) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const folderData = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        tags: formData.tags,
        organization_id: profile.organization_id,
        created_by: profile.id
      };

      if (folder?.id) {
        // Update existing folder
        const { error } = await (supabase as any)
          .from('folders')
          .update(folderData)
          .eq('id', folder.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Folder updated successfully",
        });
      } else {
        // Create new folder
        const { error } = await (supabase as any)
          .from('folders')
          .insert([folderData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Folder created successfully",
        });
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving folder:', error);
      toast({
        title: "Error",
        description: "Failed to save folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            {folder ? 'Edit Folder' : 'Create New Folder'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Folder Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name *</Label>
            <Input
              id="name"
              placeholder="Enter folder name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter folder description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <Select
              value={formData.icon}
              onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an icon" />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    {icon.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {availableColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.color === color.value 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  } bg-gradient-to-br ${color.bg}`}
                >
                  <div className="text-center">
                    <div className={`h-4 w-4 mx-auto mb-1 ${color.value}`}>
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">{color.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : (folder ? 'Update Folder' : 'Create Folder')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FolderManagementModal;