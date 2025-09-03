import { Task } from '@/hooks/useTasks';

interface TaskTimelineViewProps {
  tasks: Task[];
  compactMode: boolean;
  filters: any;
  onTaskUpdate: () => void;
  selectedProject: string | null;
}

export function TaskTimelineView({ tasks }: TaskTimelineViewProps) {
  return (
    <div className="p-4">
      <div className="text-center py-8 text-muted-foreground">
        <h3 className="text-lg font-semibold mb-2">Timeline View</h3>
        <p>Timeline/Gantt view coming soon. Showing tasks by creation date:</p>
        <div className="mt-4 space-y-2 max-w-md mx-auto text-left">
          {tasks.map(task => (
            <div key={task.id} className="p-2 border rounded bg-card">
              <div className="font-medium text-sm">{task.title}</div>
              <div className="text-xs text-muted-foreground">
                Created: {new Date(task.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}