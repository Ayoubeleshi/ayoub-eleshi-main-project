import { Briefcase, Megaphone, Palette, User, Zap, Folder, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  defaultStatuses: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  exampleTasks: Array<{
    title: string;
    status: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  tags: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'business',
    name: 'Business Project',
    description: 'Manage business initiatives, goals, and strategic projects with clear milestones.',
    icon: Briefcase,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    defaultStatuses: [
      { id: 'not_started', name: 'Planning', color: 'bg-muted' },
      { id: 'in_progress', name: 'In Progress', color: 'bg-primary' },
      { id: 'done', name: 'Completed', color: 'bg-success' }
    ],
    exampleTasks: [
      { title: 'Create project roadmap', status: 'not_started', priority: 'high' },
      { title: 'Stakeholder alignment meeting', status: 'not_started', priority: 'medium' },
      { title: 'Resource allocation plan', status: 'not_started', priority: 'medium' }
    ],
    tags: ['strategy', 'planning', 'stakeholders', 'milestones']
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    description: 'Plan and execute marketing campaigns with content creation and performance tracking.',
    icon: Megaphone,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    defaultStatuses: [
      { id: 'not_started', name: 'Ideas', color: 'bg-muted' },
      { id: 'in_progress', name: 'Creating', color: 'bg-secondary' },
      { id: 'done', name: 'Published', color: 'bg-success' }
    ],
    exampleTasks: [
      { title: 'Create campaign strategy', status: 'not_started', priority: 'high' },
      { title: 'Design social media assets', status: 'not_started', priority: 'medium' },
      { title: 'Write email sequences', status: 'not_started', priority: 'medium' }
    ],
    tags: ['content', 'social-media', 'analytics', 'campaigns']
  },
  {
    id: 'design',
    name: 'Design Project',
    description: 'Manage design workflows from concept to delivery with review stages.',
    icon: Palette,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    defaultStatuses: [
      { id: 'not_started', name: 'Concept', color: 'bg-muted' },
      { id: 'in_progress', name: 'Designing', color: 'bg-warning' },
      { id: 'done', name: 'Approved', color: 'bg-success' }
    ],
    exampleTasks: [
      { title: 'Research and mood board', status: 'not_started', priority: 'high' },
      { title: 'Create wireframes', status: 'not_started', priority: 'high' },
      { title: 'Design mockups', status: 'not_started', priority: 'medium' }
    ],
    tags: ['wireframes', 'mockups', 'review', 'assets']
  },
  {
    id: 'personal',
    name: 'Personal Tasks',
    description: 'Organize personal goals, habits, and daily tasks for better life management.',
    icon: User,
    color: 'text-success',
    bgColor: 'bg-success/10',
    defaultStatuses: [
      { id: 'not_started', name: 'To Do', color: 'bg-muted' },
      { id: 'in_progress', name: 'Doing', color: 'bg-success' },
      { id: 'done', name: 'Done', color: 'bg-success-dark' }
    ],
    exampleTasks: [
      { title: 'Morning workout routine', status: 'not_started', priority: 'medium' },
      { title: 'Read 30 minutes daily', status: 'not_started', priority: 'low' },
      { title: 'Plan weekend activities', status: 'not_started', priority: 'low' }
    ],
    tags: ['health', 'learning', 'habits', 'goals']
  },
  {
    id: 'productivity',
    name: 'Productivity System',
    description: 'Boost productivity with task prioritization and time management techniques.',
    icon: Zap,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    defaultStatuses: [
      { id: 'not_started', name: 'Backlog', color: 'bg-muted' },
      { id: 'in_progress', name: 'Active', color: 'bg-destructive' },
      { id: 'done', name: 'Complete', color: 'bg-success' }
    ],
    exampleTasks: [
      { title: 'Organize digital workspace', status: 'not_started', priority: 'high' },
      { title: 'Set up task automation', status: 'not_started', priority: 'medium' },
      { title: 'Weekly review process', status: 'not_started', priority: 'medium' }
    ],
    tags: ['automation', 'organization', 'efficiency', 'systems']
  }
];

interface ProjectTemplatesSelectorProps {
  onSelectTemplate: (template: ProjectTemplate | null) => void;
  selectedTemplate: ProjectTemplate | null;
}

export function ProjectTemplatesSelector({ onSelectTemplate, selectedTemplate }: ProjectTemplatesSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Custom/Empty Template */}
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
          selectedTemplate === null ? 'border-primary bg-primary/5' : 'border-border hover:border-border/60'
        }`}
        onClick={() => onSelectTemplate(null)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Custom Project</CardTitle>
              <CardDescription className="text-xs">Start from scratch</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Template Options */}
      {PROJECT_TEMPLATES.map(template => {
        const Icon = template.icon;
        const isSelected = selectedTemplate?.id === template.id;
        
        return (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/60'
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${template.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${template.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed mt-1">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-muted-foreground">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}