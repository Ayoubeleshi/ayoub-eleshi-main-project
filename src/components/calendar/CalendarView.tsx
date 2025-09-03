import { ViewType, EventData, CalendarData } from './CalendarModule';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';
import { MonthView } from './views/MonthView';
import { AgendaView } from './views/AgendaView';

interface CalendarViewProps {
  view: ViewType;
  currentDate: Date;
  events: EventData[];
  calendars: CalendarData[];
  onEventClick: (event: EventData) => void;
  onCreateEvent: () => void;
  onEventDelete: (eventId: string) => void;
  isLoading: boolean;
}

export function CalendarView({
  view,
  currentDate,
  events,
  calendars,
  onEventClick,
  onCreateEvent,
  onEventDelete,
  isLoading
}: CalendarViewProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  const commonProps = {
    currentDate,
    events,
    calendars,
    onEventClick,
    onCreateEvent,
    onEventDelete
  };

  switch (view) {
    case 'day':
      return <DayView {...commonProps} />;
    case 'week':
      return <WeekView {...commonProps} />;
    case 'month':
      return <MonthView {...commonProps} />;
    case 'agenda':
      return <AgendaView {...commonProps} />;
    default:
      return <MonthView {...commonProps} />;
  }
}