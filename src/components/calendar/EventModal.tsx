import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Users, Video, Bell, Repeat, Palette } from 'lucide-react';
import { EventData, CalendarData } from './CalendarModule';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventData | null;
  calendars: CalendarData[];
  selectedCalendarId: string | null;
  onEventSaved: () => void;
  onEventDelete: (eventId: string) => void;
}

const colorOptions = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export function EventModal({ isOpen, onClose, event, calendars, selectedCalendarId, onEventSaved, onEventDelete }: EventModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    calendar_id: '',
    location: '',
    online_provider: '' as '' | 'google_meet' | 'zoom' | 'teams' | 'custom',
    online_join_url: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    all_day: false,
    color: '#3b82f6',
    attendees: [] as string[],
    reminders: [10], // Default 10 minutes before
  });

  const [newAttendee, setNewAttendee] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (event) {
        // Edit mode
        const startDate = new Date(event.start_at);
        const endDate = new Date(event.end_at);
        
        setFormData({
          title: event.title,
          description: event.description || '',
          calendar_id: event.calendar_id,
          location: event.location || '',
          online_provider: event.online_provider || '',
          online_join_url: event.online_join_url || '',
          start_date: format(startDate, 'yyyy-MM-dd'),
          start_time: event.all_day ? '' : format(startDate, 'HH:mm'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          end_time: event.all_day ? '' : format(endDate, 'HH:mm'),
          all_day: event.all_day,
          color: event.color || '#3b82f6',
          attendees: event.attendees?.map(a => a.email) || [],
          reminders: [10],
        });
      } else {
        // Create mode
        const now = new Date();
        const selectedCalendar = calendars.find(c => c.id === selectedCalendarId) || calendars.find(c => c.is_primary) || calendars[0];
        
        setFormData({
          title: '',
          description: '',
          calendar_id: selectedCalendar?.id || '',
          location: '',
          online_provider: '',
          online_join_url: '',
          start_date: format(now, 'yyyy-MM-dd'),
          start_time: format(now, 'HH:mm'),
          end_date: format(now, 'yyyy-MM-dd'),
          end_time: format(new Date(now.getTime() + 60 * 60 * 1000), 'HH:mm'),
          all_day: false,
          color: selectedCalendar?.color || '#3b82f6',
          attendees: [],
          reminders: [10],
        });
      }
    }
  }, [isOpen, event, calendars, selectedCalendarId]);

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.calendar_id) {
      toast({
        title: "Validation Error",
        description: "Title and calendar are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let startDateTime: Date;
      let endDateTime: Date;

      if (formData.all_day) {
        startDateTime = new Date(formData.start_date + 'T00:00:00');
        endDateTime = new Date(formData.end_date + 'T23:59:59');
      } else {
        startDateTime = new Date(`${formData.start_date}T${formData.start_time}`);
        endDateTime = new Date(`${formData.end_date}T${formData.end_time}`);
      }

      const eventData = {
        title: formData.title,
        description: formData.description || null,
        calendar_id: formData.calendar_id,
        location: formData.location || null,
        online_provider: formData.online_provider || null,
        online_join_url: formData.online_join_url || null,
        start_at: startDateTime.toISOString(),
        end_at: endDateTime.toISOString(),
        all_day: formData.all_day,
        color: formData.color,
        created_by: profile?.id,
        updated_by: profile?.id,
      };

      let savedEvent;
      if (event) {
        // Update existing event
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select()
          .single();

        if (error) throw error;
        savedEvent = data;
      } else {
        // Create new event
        const { data, error } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single();

        if (error) throw error;
        savedEvent = data;
      }

      // Handle attendees
      if (savedEvent && formData.attendees.length > 0) {
        // Delete existing attendees if editing
        if (event) {
          await supabase
            .from('event_attendees')
            .delete()
            .eq('event_id', event.id);
        }

        // Add new attendees
        const attendeeData = formData.attendees.map(email => ({
          event_id: savedEvent.id,
          email,
          name: email,
          is_internal: false,
          status: 'invited' as const,
        }));

        await supabase
          .from('event_attendees')
          .insert(attendeeData);
      }

      toast({
        title: "Success",
        description: `Event ${event ? 'updated' : 'created'} successfully`,
      });

      onEventSaved();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: `Failed to ${event ? 'update' : 'create'} event`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMeetingLink = () => {
    if (formData.online_provider === 'google_meet') {
      const meetingId = Math.random().toString(36).substring(2, 15);
      setFormData(prev => ({ 
        ...prev, 
        online_join_url: `https://meet.google.com/${meetingId}` 
      }));
    }
  };

  const addAttendee = () => {
    if (newAttendee && !formData.attendees.includes(newAttendee)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee]
      }));
      setNewAttendee('');
    }
  };

  const removeAttendee = (email: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== email)
    }));
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {event ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="calendar">Calendar *</Label>
                <Select
                  value={formData.calendar_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, calendar_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select calendar" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendars.map((calendar) => (
                      <SelectItem key={calendar.id} value={calendar.id}>
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: calendar.color }}
                          />
                          <span>{calendar.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>All Day</Label>
                <Switch
                  checked={formData.all_day}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, all_day: checked }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                {!formData.all_day && (
                  <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
                {!formData.all_day && (
                  <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location & Online Meeting */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Meeting location"
                />
              </div>

              <div>
                <Label htmlFor="online_provider">Online Meeting</Label>
                <Select
                  value={formData.online_provider}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, online_provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add online meeting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="google_meet">Google Meet</SelectItem>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="custom">Custom Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                             {formData.online_provider && (
                <div>
                  <Label htmlFor="meeting_url">Meeting Link</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="meeting_url"
                      value={formData.online_join_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, online_join_url: e.target.value }))}
                      placeholder="https://..."
                    />
                    {formData.online_provider === 'google_meet' && (
                      <Button type="button" variant="outline" onClick={generateMeetingLink}>
                        Generate
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Attendees */}
            <div className="space-y-4">
              <Label>Attendees</Label>
              <div className="flex space-x-2">
                <Input
                  value={newAttendee}
                  onChange={(e) => setNewAttendee(e.target.value)}
                  placeholder="Email address"
                  onKeyPress={(e) => e.key === 'Enter' && addAttendee()}
                />
                <Button type="button" variant="outline" onClick={addAttendee}>
                  Add
                </Button>
              </div>
              {formData.attendees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.attendees.map((email) => (
                    <Badge key={email} variant="secondary" className="cursor-pointer">
                      {email}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => removeAttendee(email)}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full border-2 ${
                      formData.color === color ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              {event && (
                <Button 
                  variant="destructive" 
                                   onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                >
                  Delete Event
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete "{event?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (event) {
                    onEventDelete(event.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }
                }}
              >
                Delete Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}