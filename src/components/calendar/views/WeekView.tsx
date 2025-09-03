import { Card } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachHourOfInterval, startOfDay, isSameDay, isToday } from 'date-fns';
import { EventData, CalendarData } from '../CalendarModule';

interface WeekViewProps {
  currentDate: Date;
  events: EventData[];
  calendars: CalendarData[];
  onEventClick: (event: EventData) => void;
  onCreateEvent: () => void;
  onEventDelete: (eventId: string) => void;
}

export function WeekView({ currentDate, events, calendars, onEventClick, onCreateEvent, onEventDelete }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_at), day));
  };

  const getEventPosition = (event: EventData) => {
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    
    if (event.all_day) {
      return { top: 0, height: 'auto' };
    }

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = endHour - startHour;

    return {
      top: `${(startHour / 24) * 100}%`,
      height: `${(duration / 24) * 100}%`,
    };
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with days */}
      <div className="border-b border-border">
        <div className="grid grid-cols-8 h-16">
          <div className="border-r border-border"></div>
          {days.map((day) => (
            <div key={day.toISOString()} className="flex flex-col items-center justify-center border-r border-border">
              <div className="text-xs text-muted-foreground uppercase">
                {format(day, 'EEE')}
              </div>
              <div
                className={`text-lg font-medium ${
                  isToday(day)
                    ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center'
                    : 'text-foreground'
                }`}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {/* Hour lines */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border h-16">
              <div className="border-r border-border p-2 text-xs text-muted-foreground">
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
              {days.map((day) => (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="border-r border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={onCreateEvent}
                />
              ))}
            </div>
          ))}

          {/* Events */}
          {days.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            return (
              <div key={day.toISOString()} className="absolute inset-0">
                {dayEvents.map((event) => {
                  const calendar = calendars.find(c => c.id === event.calendar_id);
                  const position = getEventPosition(event);
                  
                  if (event.all_day) {
                    return (
                      <div
                        key={event.id}
                        className="absolute z-10 mx-1 p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          left: `${(dayIndex + 1) * (100 / 8)}%`,
                          width: `${100 / 8 - 1}%`,
                          top: '4px',
                          backgroundColor: event.color || calendar?.color || '#3b82f6',
                          color: 'white',
                        }}
                        onClick={() => onEventClick(event)}
                      >
                        <div className="truncate font-medium">{event.title}</div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={event.id}
                      className="absolute z-10 mx-1 p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                      style={{
                        left: `${(dayIndex + 1) * (100 / 8)}%`,
                        width: `${100 / 8 - 1}%`,
                        top: position.top,
                        height: position.height,
                        backgroundColor: event.color || calendar?.color || '#3b82f6',
                        color: 'white',
                        minHeight: '20px',
                      }}
                      onClick={() => onEventClick(event)}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      {event.location && (
                        <div className="truncate text-xs opacity-75">{event.location}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}