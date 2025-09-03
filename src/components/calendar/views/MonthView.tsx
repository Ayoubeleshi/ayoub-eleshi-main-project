import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday } from 'date-fns';
import { EventData, CalendarData } from '../CalendarModule';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  events: EventData[];
  calendars: CalendarData[];
  onEventClick: (event: EventData) => void;
  onCreateEvent: () => void;
  onEventDelete: (eventId: string) => void;
}

export function MonthView({ currentDate, events, calendars, onEventClick, onCreateEvent, onEventDelete }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_at), day));
  };

  return (
    <div className="flex-1 p-4">
      <div className="h-full flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekdays.map((weekday) => (
            <div key={weekday} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {weekday}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-border">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <Card key={day.toISOString()} className="relative min-h-[120px] p-2 rounded-none border-0 bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm ${
                      isDayToday
                        ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center font-medium'
                        : isCurrentMonth
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                    onClick={onCreateEvent}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const calendar = calendars.find(c => c.id === event.calendar_id);
                    return (
                      <div
                        key={event.id}
                        className="group relative text-xs px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
                        style={{ 
                          backgroundColor: event.color || calendar?.color || '#3b82f6',
                          color: 'white'
                        }}
                        onClick={() => onEventClick(event)}
                        title={event.title}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate flex-1">
                            {event.all_day ? event.title : `${format(new Date(event.start_at), 'HH:mm')} ${event.title}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}