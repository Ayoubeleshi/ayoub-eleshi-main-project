import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, startOfDay, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { EventData, CalendarData } from '../CalendarModule';
import { Calendar, Clock, MapPin, Users, Video, Plus } from 'lucide-react';

interface AgendaViewProps {
  currentDate: Date;
  events: EventData[];
  calendars: CalendarData[];
  onEventClick: (event: EventData) => void;
  onCreateEvent: () => void;
  onEventDelete: (eventId: string) => void;
}

export function AgendaView({ currentDate, events, calendars, onEventClick, onCreateEvent, onEventDelete }: AgendaViewProps) {
  // Group events by date for the next 30 days
  const dateGroups: { [key: string]: EventData[] } = {};
  
  for (let i = 0; i < 30; i++) {
    const day = addDays(currentDate, i);
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter(event => isSameDay(new Date(event.start_at), day));
    
    if (dayEvents.length > 0) {
      dateGroups[dayKey] = dayEvents.sort((a, b) => 
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      );
    }
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMMM d');
  };

  return (
    <div className="flex-1 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Agenda</h2>
            <p className="text-muted-foreground">Upcoming events and meetings</p>
          </div>
          <Button onClick={onCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
        </div>

        {/* Events grouped by date */}
        {Object.keys(dateGroups).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">No upcoming events</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any events scheduled for the next 30 days.
              </p>
              <Button onClick={onCreateEvent}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first event
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(dateGroups).map(([dateKey, dayEvents]) => {
            const date = new Date(dateKey);
            return (
              <Card key={dateKey}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    {getDateLabel(date)} - {format(date, 'MMMM d, yyyy')}
                    <Badge variant="secondary" className="ml-2">
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayEvents.map((event) => {
                    const calendar = calendars.find(c => c.id === event.calendar_id);
                    return (
                      <Card
                        key={event.id}
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: event.color || calendar?.color || '#3b82f6' }}
                              />
                              <h4 className="font-semibold text-lg">{event.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {calendar?.name || 'Unknown'}
                              </Badge>
                            </div>

                            {event.description && (
                              <p className="text-muted-foreground mb-3 line-clamp-2">
                                {event.description}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                {event.all_day ? (
                                  'All day'
                                ) : (
                                  `${format(new Date(event.start_at), 'h:mm a')} - ${format(new Date(event.end_at), 'h:mm a')}`
                                )}
                              </div>

                              {event.location && (
                                <div className="flex items-center">
                                  <MapPin className="mr-2 h-4 w-4" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}

                              {event.attendees && event.attendees.length > 0 && (
                                <div className="flex items-center">
                                  <Users className="mr-2 h-4 w-4" />
                                  {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                                </div>
                              )}

                              {event.online_join_url && (
                                <div className="flex items-center">
                                  <Video className="mr-2 h-4 w-4" />
                                  Online meeting available
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            {event.online_join_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(event.online_join_url, '_blank');
                                }}
                              >
                                <Video className="mr-2 h-4 w-4" />
                                Join
                              </Button>
                            )}
                            
                            <Badge 
                              variant={
                                event.status === 'confirmed' ? 'default' : 
                                event.status === 'tentative' ? 'secondary' : 'destructive'
                              }
                            >
                              {event.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}