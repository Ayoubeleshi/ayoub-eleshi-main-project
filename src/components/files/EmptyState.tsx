import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FolderOpen, FileText } from 'lucide-react';

interface EmptyStateProps {
  onUpload?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onUpload }) => {
  return (
    <div className="text-center py-16">
      <div className="mx-auto max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">No files yet</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Start building your file library by uploading your first document. 
          You can organize files into folders and share them with your team.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={onUpload} className="w-full sm:w-auto">
            <Upload className="w-4 h-4 mr-2" />
            Upload your first file
          </Button>
          <p className="text-xs text-muted-foreground">
            Supports PDF, DOC, XLS, PPT, images, and more
          </p>
        </div>

        {/* Tips */}
        <div className="mt-8 pt-6 border-t">
          <h4 className="text-sm font-medium mb-3">Quick tips:</h4>
          <div className="space-y-2 text-xs text-muted-foreground text-left">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Drag and drop files directly onto the upload area</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Organize files by department or project</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Add tags and descriptions for better searchability</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;