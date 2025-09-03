import { useState } from 'react';
import { Calendar, Clock, Users, Video, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: string;
  type: 'video' | 'in-person';
  attendees: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'confirmed' | 'pending' | 'declined';
  }>;
  status: 'upcoming' | 'ongoing' | 'completed';
}

const MeetingsSection = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Daily Standup Call',
      description: 'Discuss team tasks for the day',
      date: '2024-08-24',
      time: '9:00 AM',
      duration: '30 min',
      type: 'video',
      attendees: [
        { id: '1', name: 'John Doe', status: 'confirmed' },
        { id: '2', name: 'Jane Smith', status: 'confirmed' },
        { id: '3', name: 'Mike Johnson', status: 'pending' },
      ],
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Brand Identity Meeting',
      description: 'Discuss brand identity guidelines for the print media',
      date: '2024-08-24',
      time: '11:00 AM',
      duration: '60 min',
      type: 'video',
      attendees: [
        { id: '1', name: 'Ali Ahmad', status: 'confirmed' },
        { id: '2', name: 'Maria Memon', status: 'confirmed' },
      ],
      status: 'upcoming'
    }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState<{
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    type: 'video' | 'in-person';
  }>({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
    type: 'video'
  });

  const handleCreateMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) return;

    const meeting: Meeting = {
      id: Date.now().toString(),
      ...newMeeting,
      attendees: [],
      status: 'upcoming'
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '30',
      type: 'video'
    });
    setIsCreateOpen(false);
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming');
  const todayMeetings = meetings.filter(m => m.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground">Schedule and manage your team meetings</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Enter meeting title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                  placeholder="Meeting description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={newMeeting.duration} onValueChange={(value) => setNewMeeting({ ...newMeeting, duration: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Meeting Type</Label>
                  <Select value={newMeeting.type} onValueChange={(value) => setNewMeeting({ ...newMeeting, type: value as 'video' | 'in-person' })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="in-person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateMeeting} className="bg-primary hover:bg-primary-dark">
                Create Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's Meetings */}
      {todayMeetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayMeetings.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-surface transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  <div>
                    <h3 className="font-medium text-foreground">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground">{meeting.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meeting.time} ({meeting.duration})
                      </span>
                      <span className="flex items-center gap-1">
                        {meeting.type === 'video' ? <Video className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {meeting.type === 'video' ? 'Video Call' : 'In Person'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {meeting.attendees.slice(0, 3).map((attendee) => (
                      <Avatar key={attendee.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {attendee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {meeting.attendees.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                        +{meeting.attendees.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Upcoming Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming meetings</h3>
              <p className="text-muted-foreground mb-4">Create your first meeting to get started</p>
              <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                Create Meeting
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-surface transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {new Date(meeting.date).getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString('en', { month: 'short' })}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-foreground">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-sm text-muted-foreground">{meeting.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meeting.time} ({meeting.duration})
                        </span>
                        <span className="flex items-center gap-1">
                          {meeting.type === 'video' ? <Video className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {meeting.type === 'video' ? 'Video Call' : 'In Person'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {meeting.attendees.slice(0, 3).map((attendee) => (
                        <Avatar key={attendee.id} className="w-8 h-8 border-2 border-background">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {attendee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {meeting.attendees.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                          +{meeting.attendees.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingsSection;