import { Task } from '@/hooks/useTasks';

interface TaskCalendarViewProps {
  tasks: Task[];
  compactMode: boolean;
  filters: any;
  onTaskUpdate: () => void;
  selectedProject: string | null;
}

export function TaskCalendarView({ tasks }: TaskCalendarViewProps) {
  return (
    <div className="p-4">
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
        <p>Calendar view coming soon. For now, showing tasks with due dates:</p>
        <div className="mt-4 space-y-2 max-w-md mx-auto text-left">
          {tasks.filter(t => t.due_date).map(task => (
            <div key={task.id} className="p-2 border rounded bg-card">
              <div className="font-medium text-sm">{task.title}</div>
              <div className="text-xs text-muted-foreground">
                Due: {new Date(task.due_date!).toLocaleDateString()}
              </div>
            </div>
          ))}
          {tasks.filter(t => t.due_date).length === 0 && (
            <div className="text-sm text-muted-foreground">No tasks with due dates</div>
          )}
        </div>
      </div>
    </div>
  );
}