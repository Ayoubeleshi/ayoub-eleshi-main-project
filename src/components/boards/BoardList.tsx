import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Calendar, Users } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BoardForm } from './BoardForm';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function BoardList() {
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const { data: projects = [], isLoading, error } = useProjects();
  const navigate = useNavigate();

  console.log('BoardList: Render state:', { 
    projectsCount: projects.length, 
    isLoading, 
    error: !!error,
    projects: projects 
  });

  const handleBoardClick = (projectId: string) => {
    navigate(`/tasks/boards/${projectId}`);
  };

  // Show loading state while auth is still loading
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="h-8 bg-muted rounded-lg w-48 mx-auto mb-2"></div>
          <div className="h-5 bg-muted/60 rounded w-64 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="animate-pulse">
                <div className="h-2 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted/60 rounded w-3/4"></div>
                    </div>
                    <div className="h-6 bg-muted rounded-full w-16 ml-2"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-muted/60 rounded w-24"></div>
                    <div className="h-4 bg-muted/60 rounded w-16"></div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              Boards
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Organize your work into focused boards and track progress with intuitive views
            </p>
          </div>
        </div>
        
        <div className="text-center py-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 rounded-full blur-3xl"></div>
            <div className="relative w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="text-destructive text-2xl">⚠️</div>
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-2">Error Loading Boards</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            There was an error loading your boards. Please try refreshing the page.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            size="lg"
            className="bg-gradient-brand hover:opacity-90 transition-opacity"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              Boards
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Organize your work into focused boards and track progress with intuitive views
            </p>
          </div>
          
          <Button 
            onClick={() => setCreateBoardOpen(true)}
            size="lg"
            className="bg-gradient-brand hover:opacity-90 transition-opacity shadow-brand"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Board
          </Button>
        </div>

        {/* Boards Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-full blur-3xl"></div>
              <FolderOpen className="relative w-16 h-16 text-muted-foreground mx-auto mb-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No boards yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first board to start organizing tasks into a beautiful Kanban workflow
            </p>
            <Button 
              onClick={() => setCreateBoardOpen(true)}
              size="lg"
              className="bg-gradient-brand hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card
                key={project.id}
                className={cn(
                  "group cursor-pointer overflow-hidden transition-all duration-300",
                  "hover:shadow-brand hover:-translate-y-1 hover:scale-[1.02]",
                  "border-0 bg-gradient-card backdrop-blur-sm",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleBoardClick(project.id)}
              >
                {/* Gradient top border */}
                <div className="h-1 bg-gradient-brand"></div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2 line-clamp-2 text-muted-foreground">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        "ml-2 transition-colors",
                        project.status === 'active' && 'bg-success/10 text-success border-success/20'
                      )}
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created {format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-primary/70">
                      <Users className="w-4 h-4" />
                      <span>Board</span>
                    </div>
                  </div>
                  
                  {/* Progress indicator placeholder */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Ready to organize</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-success/60"></div>
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Board Form */}
      <BoardForm
        open={createBoardOpen}
        onOpenChange={setCreateBoardOpen}
      />
    </>
  );
}