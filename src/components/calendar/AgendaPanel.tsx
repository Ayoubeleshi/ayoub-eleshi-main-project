import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { Clock, Users, Video, MapPin } from 'lucide-react';
import { EventData } from './CalendarModule';

interface AgendaPanelProps {
  events: EventData[];
  selectedDate: Date;
  onEventClick: (event: EventData) => void;
}

export function AgendaPanel({ events, selectedDate, onEventClick }: AgendaPanelProps) {
  const selectedDateEvents = events.filter(event => 
    isSameDay(new Date(event.start_at), selectedDate)
  );

  return (
    <div className="w-80 border-l border-border bg-card">
      <Card className="h-full rounded-none border-none">
        <CardHeader>
          <CardTitle className="text-sm">
            {format(selectedDate, 'EEEE, MMMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedDateEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No events today</p>
            </div>
          ) : (
            selectedDateEvents.map((event) => (
              <Card 
                key={event.id} 
                className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onEventClick(event)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1 ml-2"
                      style={{ backgroundColor: event.color || event.calendar?.color }}
                    />
                  </div>

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    {event.all_day ? (
                      'All day'
                    ) : (
                      `${format(new Date(event.start_at), 'h:mm a')} - ${format(new Date(event.end_at), 'h:mm a')}`
                    )}
                  </div>

                  {event.location && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}

                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="mr-1 h-3 w-3" />
                      {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {event.calendar?.name || 'Unknown'}
                    </Badge>
                    
                    {event.online_join_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(event.online_join_url, '_blank');
                        }}
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}