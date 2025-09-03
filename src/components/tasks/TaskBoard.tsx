// Legacy TaskBoard - Re-export the new TaskKanbanBoard for backward compatibility
import { TaskKanbanBoard } from './TaskKanbanBoard';

export { TaskKanbanBoard as TaskBoard };
export default TaskKanbanBoard;