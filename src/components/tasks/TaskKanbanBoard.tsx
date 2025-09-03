import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, useTasks, useDeleteTask } from '@/hooks/useTasks';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { TaskCard } from './TaskCard';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { TaskForm } from './TaskForm';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface TaskFilters {
  search?: string;
  status?: string[];
  assignee?: string;
}

interface TaskKanbanBoardProps {
  filters?: TaskFilters;
  projectId?: string;
}

const columns = [
  {
    id: 'not_started' as const,
    title: 'Not Started',
    description: 'Tasks that haven\'t been started yet',
    icon: '📋',
  },
  {
    id: 'in_progress' as const,
    title: 'In Progress', 
    description: 'Tasks currently being worked on',
    icon: '⚡',
  },
  {
    id: 'done' as const,
    title: 'Done',
    description: 'Completed tasks',
    icon: '✅',
  },
];

// Droppable Column Component
function DroppableColumn({ 
  column, 
  tasks, 
  onCreateTask, 
  onTaskClick, 
  onTaskEdit, 
  onTaskDelete 
}: {
  column: typeof columns[0];
  tasks: Task[];
  onCreateTask: () => void;
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "relative group transition-all duration-300 h-full",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:opacity-0 before:transition-opacity before:duration-300",
        column.id === 'not_started' && "before:from-muted/20 before:to-muted/10",
        column.id === 'in_progress' && "before:from-primary/20 before:to-primary/10", 
        column.id === 'done' && "before:from-success/20 before:to-success/10",
        isOver && "before:opacity-100 scale-[1.02] shadow-2xl"
      )}
    >
      <Card className={cn(
        "relative h-full overflow-hidden border-0 backdrop-blur-sm transition-all duration-300",
        "bg-gradient-to-br from-card/90 to-card/70",
        "group-hover:shadow-lg",
        isOver && "ring-2 ring-opacity-50",
        column.id === 'not_started' && isOver && "ring-muted-foreground",
        column.id === 'in_progress' && isOver && "ring-primary",
        column.id === 'done' && isOver && "ring-success"
      )}>
        {/* Gradient top border */}
        <div className={cn(
          "h-1 transition-all duration-300",
          column.id === 'not_started' && "bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30",
          column.id === 'in_progress' && "bg-gradient-to-r from-primary to-primary/70",
          column.id === 'done' && "bg-gradient-to-r from-success to-success/70"
        )}></div>
        
        {/* Column Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                column.id === 'not_started' && "bg-muted-foreground/60",
                column.id === 'in_progress' && "bg-primary animate-pulse",
                column.id === 'done' && "bg-success"
              )}></div>
              
              <div>
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {column.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
            
            <Badge 
              variant="secondary" 
              className={cn(
                "px-3 py-1 text-sm font-semibold transition-all duration-300",
                "bg-background/80 backdrop-blur-sm",
                column.id === 'not_started' && "text-muted-foreground border-muted-foreground/20",
                column.id === 'in_progress' && "text-primary border-primary/20",
                column.id === 'done' && "text-success border-success/20"
              )}
            >
              {tasks.length}
            </Badge>
          </div>
        </div>

        {/* Tasks Area */}
        <div className="px-6 pb-6">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className={cn(
              "space-y-4 min-h-[400px] transition-all duration-300 rounded-lg p-3 -m-3",
              isOver && "bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm"
            )}>
              {tasks.map((task, index) => (
                <div 
                  key={task.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TaskCard
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onEdit={() => onTaskEdit(task)}
                    onDelete={() => onTaskDelete(task)}
                  />
                </div>
              ))}
              
              {/* Add Task Button */}
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-16 border-2 border-dashed transition-all duration-300 group/button",
                  "hover:border-solid hover:shadow-md hover:-translate-y-1",
                  "focus:border-solid focus:shadow-md focus:-translate-y-1",
                  "relative overflow-hidden",
                  column.id === 'not_started' && "border-muted-foreground/30 hover:border-muted-foreground hover:bg-muted/10 hover:text-muted-foreground",
                  column.id === 'in_progress' && "border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary",
                  column.id === 'done' && "border-success/30 hover:border-success hover:bg-success/10 hover:text-success",
                  isOver && "border-solid opacity-80"
                )}
                onClick={onCreateTask}
              >
                <div className="flex items-center space-x-3">
                  <Plus className="w-5 h-5 transition-transform group-hover/button:scale-110 group-hover/button:rotate-90" />
                  <span className="font-semibold">Add Task</span>
                </div>
                
                {/* Hover effect background */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 -z-10",
                  column.id === 'not_started' && "bg-gradient-to-r from-muted/5 to-muted/10",
                  column.id === 'in_progress' && "bg-gradient-to-r from-primary/5 to-primary/10",
                  column.id === 'done' && "bg-gradient-to-r from-success/5 to-success/10"
                )}></div>
              </Button>
            </div>
          </SortableContext>
        </div>
      </Card>
    </div>
  );
}

export function TaskKanbanBoard({ filters, projectId }: TaskKanbanBoardProps) {
  // Add project_id filter if provided
  const taskFilters = projectId ? { ...filters, project_id: projectId } : filters;
  const { data: tasks = [], isLoading, error } = useTasks(taskFilters);
  const deleteTaskMutation = useDeleteTask();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskStatus, setCreateTaskStatus] = useState<'not_started' | 'in_progress' | 'done' | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    draggedTask,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    isUpdating,
  } = useTaskDragDrop();

  // Debug logging
  console.log('TaskKanbanBoard render:', { 
    filters, 
    projectId, 
    taskFilters, 
    tasks: tasks.length, 
    isLoading, 
    error 
  });

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = tasks.filter(task => task.status === column.id);
    return acc;
  }, {} as Record<string, Task[]>);

  console.log('TaskKanbanBoard tasksByStatus:', tasksByStatus);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-8 bg-gradient-card backdrop-blur-sm border-0 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Error Loading Tasks</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              There was an error loading your tasks. Please try refreshing the page.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Error: {error.message}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskDelete = (task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(task.id);
    }
  };

  const handleCreateTask = (status: 'not_started' | 'in_progress' | 'done') => {
    console.log('Creating task with status:', status, 'and projectId:', projectId);
    setCreateTaskStatus(status);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {columns.map((column, index) => (
          <div key={column.id} className="animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-card/90 to-card/70">
              {/* Gradient top border */}
              <div className={cn(
                "h-1",
                column.id === 'not_started' && "bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30",
                column.id === 'in_progress' && "bg-gradient-to-r from-primary to-primary/70",
                column.id === 'done' && "bg-gradient-to-r from-success to-success/70"
              )}></div>
              
              <div className="p-6 pb-4">
                <div className="animate-pulse">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <div className="h-6 bg-muted rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-muted/50 rounded w-20"></div>
                </div>
              </div>
              
              <div className="px-6 pb-6">
                <div className="space-y-4 min-h-[400px]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border-l-2 border-muted/50"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  console.log('TaskKanbanBoard render:', { tasks: tasks.length, projectId, tasksByStatus });

  return (
    <>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={({ active }) => {
          const task = tasks.find(t => t.id === active.id);
          if (task) {
            console.log('Drag start:', task);
            handleDragStart(task);
          }
        }}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 auto-rows-fr">
          {columns.map((column, index) => (
            <div 
              key={column.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <DroppableColumn
                column={column}
                tasks={tasksByStatus[column.id] || []}
                onCreateTask={() => handleCreateTask(column.id)}
                onTaskClick={handleTaskClick}
                onTaskEdit={handleTaskEdit}
                onTaskDelete={handleTaskDelete}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {draggedTask ? (
            <div className="rotate-3 scale-105">
              <TaskCard
                task={draggedTask}
                onClick={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        onEdit={() => {
          if (selectedTask) {
            setEditingTask(selectedTask);
            setSelectedTask(null);
          }
        }}
        onDelete={() => {
          if (selectedTask) {
            handleTaskDelete(selectedTask);
            setSelectedTask(null);
          }
        }}
      />

      {/* Create Task Form */}
      <TaskForm
        open={!!createTaskStatus}
        onOpenChange={(open) => !open && setCreateTaskStatus(null)}
        initialStatus={createTaskStatus}
        projectId={projectId}
      />

      {/* Edit Task Form */}
      <TaskForm
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        projectId={projectId}
      />
    </>
  );
}