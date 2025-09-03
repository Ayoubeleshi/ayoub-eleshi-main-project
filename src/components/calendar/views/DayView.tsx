import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, eachHourOfInterval, startOfDay, endOfDay, isSameDay, isToday } from 'date-fns';
import { EventData, CalendarData } from '../CalendarModule';
import { MapPin, Users, Video } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  events: EventData[];
  calendars: CalendarData[];
  onEventClick: (event: EventData) => void;
  onCreateEvent: () => void;
  onEventDelete: (eventId: string) => void;
}

export function DayView({ currentDate, events, calendars, onEventClick, onCreateEvent, onEventDelete }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayEvents = events.filter(event => isSameDay(new Date(event.start_at), currentDate));

  const getEventPosition = (event: EventData) => {
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    
    if (event.all_day) {
      return { top: 0, height: '40px' };
    }

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = endHour - startHour;

    return {
      top: `${(startHour / 24) * 100}%`,
      height: `${Math.max((duration / 24) * 100, 2)}%`,
    };
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </h2>
            {isToday(currentDate) && (
              <Badge variant="default" className="mt-1">Today</Badge>
            )}
          </div>
          <Button onClick={onCreateEvent} size="sm">
            Add Event
          </Button>
        </div>
      </div>

      {/* All-day events */}
      {dayEvents.some(e => e.all_day) && (
        <div className="border-b border-border p-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">All Day</div>
          <div className="space-y-1">
            {dayEvents.filter(e => e.all_day).map((event) => {
              const calendar = calendars.find(c => c.id === event.calendar_id);
              return (
                <div
                  key={event.id}
                  className="p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: event.color || calendar?.color || '#3b82f6',
                    color: 'white',
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      {event.description && (
                        <div className="text-xs opacity-75 mt-1">{event.description}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Hour lines */}
        {hours.map((hour) => (
          <div key={hour} className="flex border-b border-border h-16">
            <div className="w-16 p-2 text-xs text-muted-foreground border-r border-border">
              {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
            </div>
            <div
              className="flex-1 hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={onCreateEvent}
            />
          </div>
        ))}

        {/* Timed events */}
        <div className="absolute inset-0 ml-16">
          {dayEvents.filter(e => !e.all_day).map((event) => {
            const calendar = calendars.find(c => c.id === event.calendar_id);
            const position = getEventPosition(event);
            
            return (
              <Card
                key={event.id}
                className="absolute left-2 right-2 z-10 p-2 cursor-pointer hover:shadow-md transition-shadow"
                style={{
                  top: position.top,
                  height: position.height,
                  backgroundColor: event.color || calendar?.color || '#3b82f6',
                  color: 'white',
                  minHeight: '40px',
                  borderColor: event.color || calendar?.color || '#3b82f6',
                }}
                onClick={() => onEventClick(event)}
              >
                <div className="h-full flex flex-col justify-center">
                  <div className="font-medium text-sm truncate">{event.title}</div>
                  <div className="text-xs opacity-75">
                    {format(new Date(event.start_at), 'HH:mm')} - {format(new Date(event.end_at), 'HH:mm')}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-xs opacity-75 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center text-xs opacity-75 mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  {event.online_join_url && (
                    <div className="flex items-center text-xs opacity-75 mt-1">
                      <Video className="h-3 w-3 mr-1" />
                      <span>Online meeting</span>
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