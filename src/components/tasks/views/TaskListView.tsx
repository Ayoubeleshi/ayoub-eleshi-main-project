import { Task } from '@/hooks/useTasks';

interface TaskListViewProps {
  tasks: Task[];
  compactMode: boolean;
  filters: any;
  onTaskUpdate: () => void;
  selectedProject: string | null;
}

export function TaskListView({ tasks, compactMode }: TaskListViewProps) {
  return (
    <div className="p-4">
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tasks found
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className={`p-3 border rounded-lg bg-card hover:bg-accent transition-colors ${
                compactMode ? 'py-2' : 'py-3'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className={`font-medium ${compactMode ? 'text-sm' : 'text-base'}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'not_started' ? 'To Do' :
                     task.status === 'in_progress' ? 'In Progress' : 'Done'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}