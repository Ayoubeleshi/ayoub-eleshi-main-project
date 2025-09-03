import { BoardList } from '@/components/boards/BoardList';

export default function BoardsPage() {
  return (
    <div className="p-8">
      <div className="animate-fade-in">
        <BoardList />
      </div>
    </div>
  );
}