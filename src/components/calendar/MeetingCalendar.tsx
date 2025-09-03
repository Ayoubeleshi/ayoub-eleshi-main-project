import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Users, Plus, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  meeting_url?: string;
  attendees?: Array<{
    profile_id: string;
    status: string;
    profiles: {
      full_name: string;
    };
  }>;
}

export default function MeetingCalendar() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New meeting form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');

  useEffect(() => {
    if (profile?.organization_id) {
      fetchMeetings();
    }
  }, [profile, selectedDate]);

  const fetchMeetings = async () => {
    if (!profile?.organization_id || !selectedDate) return;

    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          attendees:meeting_attendees(
            profile_id,
            status,
            profiles:profiles(full_name)
          )
        `)
        .eq('organization_id', profile.organization_id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Error",
        description: "Failed to load meetings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.organization_id || !selectedDate) return;

    try {
      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endDateTime = new Date(selectedDate);
      const [endHour, endMinute] = endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          organization_id: profile.organization_id,
          title,
          description,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          meeting_url: meetingUrl || null,
          created_by: profile.id
        })
        .select()
        .single();

      if (meetingError) throw meetingError;

      // Add creator as attendee
      if (meeting) {
        await supabase
          .from('meeting_attendees')
          .insert({
            meeting_id: meeting.id,
            profile_id: profile.id,
            status: 'accepted'
          });
      }

      toast({
        title: "Success",
        description: "Meeting created successfully",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setMeetingUrl('');
      setIsDialogOpen(false);
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive",
      });
    }
  };

  const generateMeetingUrl = () => {
    const meetingId = Math.random().toString(36).substring(2, 15);
    setMeetingUrl(`https://meet.google.com/${meetingId}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Calendar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4">
                <Plus className="mr-2 h-4 w-4" />
                New Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Meeting</DialogTitle>
              </DialogHeader>
              <form onSubmit={createMeeting} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="meetingUrl">Meeting URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="meetingUrl"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://meet.google.com/..."
                    />
                    <Button type="button" variant="outline" onClick={generateMeetingUrl}>
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Create Meeting
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            Meetings for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading meetings...</div>
          ) : meetings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No meetings scheduled for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <Card key={meeting.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {meeting.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {format(new Date(meeting.start_time), 'h:mm a')} - 
                          {format(new Date(meeting.end_time), 'h:mm a')}
                        </div>
                        {meeting.attendees && meeting.attendees.length > 0 && (
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            {meeting.attendees.length} attendees
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      {meeting.meeting_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(meeting.meeting_url, '_blank')}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join
                        </Button>
                      )}
                      <Badge variant="secondary">
                        {format(new Date(meeting.start_time), 'h:mm a')}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}