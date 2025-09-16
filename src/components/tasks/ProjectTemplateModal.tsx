import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateProject } from '@/hooks/useProjects';
import { toast } from '@/hooks/use-toast';
import { ProjectTemplatesSelector, ProjectTemplate } from './ProjectTemplates';

interface ProjectTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectTemplateModal({ open, onOpenChange }: ProjectTemplateModalProps) {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const createProjectMutation = useCreateProject();
  
  console.log('ProjectTemplateModal render - open:', open);

  const handleTemplateNext = () => {
    if (selectedTemplate) {
      setName(selectedTemplate.name);
      setDescription(selectedTemplate.description);
    }
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Project name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createProjectMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      // Reset form
      setStep('template');
      setSelectedTemplate(null);
      setName('');
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleBack = () => {
    setStep('template');
    if (!selectedTemplate) {
      setName('');
      setDescription('');
    }
  };

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate(null);
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>
            {step === 'template' ? 'Choose Project Template' : 'Project Details'}
          </DialogTitle>
          {step === 'template' && (
            <p className="text-sm text-muted-foreground">
              Select a template to get started quickly, or create a custom project from scratch.
            </p>
          )}
        </DialogHeader>
        
        {step === 'template' ? (
          <div className="space-y-4">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <ProjectTemplatesSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleTemplateNext}>
                {selectedTemplate ? 'Use Template' : 'Create Custom'}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedTemplate && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <selectedTemplate.icon className={`w-5 h-5 ${selectedTemplate.color}`} />
                  <span className="font-medium">{selectedTemplate.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name..."
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-between gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createProjectMutation.isPending}
                >
                  Create Project
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}