import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskDragDrop } from '@/hooks/useTaskDragDrop';
import { TrelloTaskCard } from '@/components/tasks/TrelloTaskCard';
import { TaskModal } from '@/components/tasks/TaskModal';
import { QuickTaskForm } from '@/components/tasks/QuickTaskForm';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskBoardViewProps {
  tasks: Task[];
  compactMode: boolean;
  filters: any;
  onTaskUpdate: () => void;
  selectedProject: string | null;
  onDeleteTask?: (taskId: string) => void;
}

interface Column {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'done';
  tasks: Task[];
  color: string;
  bgColor: string;
}

export function TaskBoardView({ tasks, compactMode, selectedProject, onDeleteTask }: TaskBoardViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState<string | null>(null);
  
  const { 
    draggedTask, 
    handleDragStart, 
    handleDragEnd, 
    handleDragCancel 
  } = useTaskDragDrop();

  const columns: Column[] = [
    { 
      id: 'not_started', 
      title: '📋 To Do', 
      status: 'not_started', 
      tasks: tasks.filter(t => t.status === 'not_started'),
      color: 'text-slate-900 dark:text-slate-100',
      bgColor: 'bg-slate-100/60 dark:bg-slate-800/50'
    },
    { 
      id: 'in_progress', 
      title: '⚡ In Progress', 
      status: 'in_progress', 
      tasks: tasks.filter(t => t.status === 'in_progress'),
      color: 'text-slate-900 dark:text-slate-100',
      bgColor: 'bg-indigo-100/50 dark:bg-indigo-900/30'
    },
    { 
      id: 'done', 
      title: '✅ Done', 
      status: 'done', 
      tasks: tasks.filter(t => t.status === 'done'),
      color: 'text-slate-900 dark:text-slate-100',
      bgColor: 'bg-emerald-100/50 dark:bg-emerald-900/30'
    }
  ];

  const handleTaskClick = (task: Task) => {
    console.log('TaskBoardView: handleTaskClick called with task:', task.id, task.title);
    setSelectedTask(task);
    setShowTaskModal(true);
    console.log('TaskBoardView: Modal state set to true');
  };

  const onDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      handleDragStart(task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    handleDragEnd(event);
  };

  return (
    <div className="h-full bg-gradient-to-br from-background to-muted/10 dark:from-background dark:to-background/70">
      <DndContext
        sensors={useSensors(
          useSensor(PointerSensor, {
            activationConstraint: { distance: 6 }
          })
        )}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-3 p-2 h-full overflow-x-auto justify-start">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-72 flex flex-col">
              {/* Column Header */}
              <div className={cn(
                'flex items-center justify-between px-4 py-2 rounded-t-lg border-b',
                column.bgColor,
                'border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm'
              )}>
                <div className="flex items-center gap-2">
                  <h3 className={cn('font-semibold text-sm', column.color)}>
                    {column.title}
                  </h3>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    'bg-muted/60 text-foreground/70'
                  )}>
                    {column.tasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0 hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setShowQuickAdd(column.status)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              {/* Column Content */}
              <div className={cn(
                'flex-1 p-2 rounded-b-lg border-x border-b border-border/50',
                column.bgColor,
                'overflow-y-auto'
              )}>
                <SortableContext 
                  items={column.tasks.map(t => t.id)} 
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {column.tasks.map(task => (
                      <TrelloTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                        compact={compactMode}
                        onDelete={onDeleteTask}
                      />
                    ))}
                    
                    {/* Empty state */}
                    {column.tasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground/50">
                        <div className="text-4xl mb-2">
                          {column.status === 'not_started' ? '📝' : 
                           column.status === 'in_progress' ? '⚡' : '🎉'}
                        </div>
                        <p className="text-sm">
                          {column.status === 'not_started' ? 'No tasks to do' : 
                           column.status === 'in_progress' ? 'No tasks in progress' : 'No completed tasks'}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => setShowQuickAdd(column.status)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add task
                        </Button>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          ))}
        </div>

        {/* Drag Overlay */}
        {createPortal(
          <DragOverlay>
            {draggedTask && (
              <TrelloTaskCard
                task={draggedTask}
                onClick={() => {}}
                compact={compactMode}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
      />

      {/* Quick Add Task Forms */}
      {showQuickAdd && (
        <QuickTaskForm
          open={!!showQuickAdd}
          onOpenChange={() => setShowQuickAdd(null)}
          initialStatus={showQuickAdd as 'not_started' | 'in_progress' | 'done'}
          projectId={selectedProject}
        />
      )}
    </div>
  );
}