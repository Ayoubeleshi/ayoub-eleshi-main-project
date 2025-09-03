import { useState, useEffect } from 'react';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarView } from './CalendarView';
import { AgendaPanel } from './AgendaPanel';
import { EventModal } from './EventModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Columns,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';

export type ViewType = 'day' | 'week' | 'month' | 'agenda';

export interface CalendarData {
  id: string;
  name: string;
  color: string;
  type: 'local' | 'google' | 'outlook';
  sharing: 'private' | 'team' | 'public';
  is_primary: boolean;
  visible: boolean;
  sync_enabled?: boolean;
  google_calendar_id?: string;
  last_sync_at?: string;
}

export interface EventData {
  id: string;
  calendar_id: string;
  title: string;
  description?: string;
  location?: string;
  online_provider?: 'google_meet' | 'zoom' | 'teams' | 'custom';
  online_join_url?: string;
  start_at: string;
  end_at: string;
  all_day: boolean;
  color?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  google_event_id?: string;
  source?: 'local' | 'google' | 'outlook';
  attendees?: Array<{
    id: string;
    email: string;
    name?: string;
    status: 'invited' | 'accepted' | 'declined' | 'tentative';
    is_organizer: boolean;
  }>;
  calendar?: {
    name: string;
    color: string;
  };
}

export default function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [calendars, setCalendars] = useState<CalendarData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

  const { profile } = useAuth();
  const { toast } = useToast();
  const { isConnected, syncGoogleCalendars, syncCalendarEvents } = useGoogleCalendar();

  useEffect(() => {
    if (profile?.organization_id) {
      loadCalendars();
    }
  }, [profile]);

  useEffect(() => {
    if (calendars.length > 0 && !selectedCalendarId) {
      // Set the first calendar as selected by default
      const primaryCalendar = calendars.find(c => c.is_primary) || calendars[0];
      setSelectedCalendarId(primaryCalendar.id);
    }
  }, [calendars, selectedCalendarId]);

  useEffect(() => {
    if (selectedCalendarId && (currentDate || view)) {
      loadEvents();
    }
  }, [selectedCalendarId, currentDate, view]);

  const loadCalendars = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      
      setCalendars(data?.map(cal => ({ 
        ...cal, 
        visible: true,
        type: cal.type as 'local' | 'google' | 'outlook',
        sharing: cal.sharing as 'private' | 'team' | 'public',
        sync_enabled: cal.sync_enabled || false
      })) || []);
    } catch (error) {
      console.error('Error loading calendars:', error);
    }
  };

  const loadEvents = async () => {
    if (!profile?.organization_id || !selectedCalendarId) return;

    try {
      const { startDate, endDate } = getDateRange(currentDate, view);
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          calendar:calendars(name, color),
          attendees:event_attendees(
            id,
            email,
            name,
            status,
            is_organizer
          )
        `)
        .eq('calendar_id', selectedCalendarId)
        .gte('start_at', startDate.toISOString())
        .lte('start_at', endDate.toISOString())
        .order('start_at');

      if (error) throw error;
      setEvents(data?.map(event => ({
        ...event,
        online_provider: event.online_provider as 'google_meet' | 'zoom' | 'teams' | 'custom' | undefined,
        status: event.status as 'confirmed' | 'tentative' | 'cancelled',
        source: event.source as 'local' | 'google' | 'outlook' | undefined,
        attendees: event.attendees?.map(att => ({
          ...att,
          status: att.status as 'invited' | 'accepted' | 'declined' | 'tentative'
        }))
      })) || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (date: Date, viewType: ViewType) => {
    let startDate: Date, endDate: Date;

    switch (viewType) {
      case 'day':
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = startOfWeek(date, { weekStartsOn: 1 });
        endDate = endOfWeek(date, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
        break;
      case 'agenda':
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = addDays(date, 30);
        break;
      default:
        startDate = startOfMonth(date);
        endDate = endOfMonth(date);
    }

    return { startDate, endDate };
  };

  const navigateDate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setCurrentDate(new Date());
      return;
    }

    const increment = direction === 'next' ? 1 : -1;
    let newDate: Date;

    switch (view) {
      case 'day':
        newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
        break;
      case 'week':
        newDate = addDays(currentDate, increment * 7);
        break;
      case 'month':
        newDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
        break;
      case 'agenda':
        newDate = addDays(currentDate, increment * 7);
        break;
      default:
        newDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
    }

    setCurrentDate(newDate);
  };

  const toggleCalendarVisibility = (calendarId: string) => {
    setCalendars(calendars.map(cal => 
      cal.id === calendarId ? { ...cal, visible: !cal.visible } : cal
    ));
  };

  const syncAllGoogleCalendars = async () => {
    if (!isConnected) return;
    
    setIsSyncing(true);
    try {
      // First sync calendars
      await syncGoogleCalendars();
      
      // Then reload local calendars and sync their events
      await loadCalendars();
      
      // Get Google calendars and sync their events
      const googleCalendars = calendars.filter(cal => cal.type === 'google' && cal.sync_enabled);
      
      for (const calendar of googleCalendars) {
        const { startDate, endDate } = getDateRange(currentDate, view);
        await syncCalendarEvents(calendar.id, startDate.toISOString(), endDate.toISOString());
      }
      
      // Reload events after sync
      await loadEvents();
      
      toast({
        title: "Sync Complete",
        description: "All Google calendars and events have been synced."
      });
    } catch (error) {
      console.error('Full sync error:', error);
      toast({
        title: "Sync Failed", 
        description: "Some calendars may not have synced properly.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (event: EventData) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "Event has been deleted."
      });

      // Reload events
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateCalendar = async (calendarData: {
    name: string;
    description?: string;
    color: string;
    type: 'local' | 'google' | 'outlook';
    sharing: 'private' | 'team' | 'public';
  }) => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('calendars')
        .insert({
          ...calendarData,
          organization_id: profile.organization_id,
          owner_id: profile.id,
          is_primary: calendars.length === 0, // First calendar becomes primary
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Calendar Created",
        description: "New calendar has been created successfully."
      });

      // Reload calendars
      loadCalendars();
    } catch (error) {
      console.error('Error creating calendar:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create calendar. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCalendar = async (calendarId: string) => {
    if (!confirm('Are you sure you want to delete this calendar? All events in this calendar will also be deleted.')) {
      return;
    }

    try {
      // First delete all events in this calendar
      const { error: eventsError } = await supabase
        .from('events')
        .delete()
        .eq('calendar_id', calendarId);

      if (eventsError) throw eventsError;

      // Then delete the calendar
      const { error: calendarError } = await supabase
        .from('calendars')
        .delete()
        .eq('id', calendarId);

      if (calendarError) throw calendarError;

      toast({
        title: "Calendar Deleted",
        description: "Calendar and all its events have been deleted."
      });

      // Reload calendars and events
      loadCalendars();
      loadEvents();
    } catch (error) {
      console.error('Error deleting calendar:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete calendar. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDateTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'agenda':
        return 'Agenda';
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Left Sidebar */}
              <CalendarSidebar
          calendars={calendars}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleCalendar={toggleCalendarVisibility}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onCalendarsUpdated={loadCalendars}
          onCreateCalendar={handleCreateCalendar}
          onDeleteCalendar={handleDeleteCalendar}
          onCalendarSelect={setSelectedCalendarId}
          selectedCalendarId={selectedCalendarId}
        />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate('today')}
              >
                Today
              </Button>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <h1 className="text-xl font-semibold">{getDateTitle()}</h1>
              
              {/* Show selected calendar */}
              {selectedCalendarId && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" 
                    style={{ 
                      backgroundColor: calendars.find(c => c.id === selectedCalendarId)?.color || '#3b82f6' 
                    }} 
                  />
                  <span className="text-sm text-muted-foreground">
                    {calendars.find(c => c.id === selectedCalendarId)?.name}
                  </span>
                </div>
              )}
              
              {isConnected && (
                <Badge variant="secondary" className="text-xs">
                  Google Connected
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Sync Button */}
              {isConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncAllGoogleCalendars}
                  disabled={isSyncing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </Button>
              )}

              {/* View Switcher */}
              <div className="flex rounded-lg border border-border bg-muted p-1">
                {(['day', 'week', 'month', 'agenda'] as ViewType[]).map((viewType) => (
                  <Button
                    key={viewType}
                    variant={view === viewType ? 'default' : 'ghost'}
                    size="sm"
                    className="px-3 py-1 text-xs"
                    onClick={() => setView(viewType)}
                  >
                    {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                  </Button>
                ))}
              </div>

              <Button onClick={handleCreateEvent} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Event
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <CalendarView
              view={view}
              currentDate={currentDate}
              events={events}
              calendars={calendars}
              onEventClick={handleEditEvent}
              onCreateEvent={handleCreateEvent}
              onEventDelete={handleDeleteEvent}
              isLoading={isLoading}
            />
          </div>

          {/* Right Panel - Agenda */}
          {view !== 'agenda' && (
            <AgendaPanel
              events={events}
              selectedDate={selectedDate || currentDate}
              onEventClick={handleEditEvent}
            />
          )}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        calendars={calendars}
        selectedCalendarId={selectedCalendarId}
        onEventSaved={() => {
          loadEvents();
          setIsEventModalOpen(false);
        }}
        onEventDelete={handleDeleteEvent}
      />
    </div>
  );
}