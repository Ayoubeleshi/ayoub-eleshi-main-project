import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Phone, 
  Video, 
  MessageSquare, 
  Calendar,
  Users,
  Search,
  PhoneCall
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  avatar?: string;
}

const QuickActions = () => {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Sarah Wilson', role: 'Designer', status: 'online' },
    { id: '2', name: 'Mike Chen', role: 'Developer', status: 'busy' },
    { id: '3', name: 'Emma Johnson', role: 'Manager', status: 'away' },
    { id: '4', name: 'Alex Rodriguez', role: 'Developer', status: 'online' },
    { id: '5', name: 'Lisa Park', role: 'Marketing', status: 'offline' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'away': return 'bg-warning';
      case 'busy': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-gradient-card border-0 shadow-custom-md">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark text-primary-foreground h-12">
                <Calendar className="w-4 h-4 mr-2" />
                New Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Quick Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Meeting Title</Label>
                  <Input placeholder="Quick team sync" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsMeetingDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-primary hover:bg-primary-dark">
                    Create Meeting
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Phone className="w-4 h-4 mr-2" />
                Call Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Call Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-hover transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        
                        <Badge variant="outline" className="text-xs capitalize">
                          {member.status}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-primary hover:text-primary-foreground"
                          disabled={member.status === 'offline'}
                        >
                          <PhoneCall className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-primary hover:text-primary-foreground"
                          disabled={member.status === 'offline'}
                        >
                          <Video className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-10">
            <MessageSquare className="w-4 h-4 mr-2" />
            New Chat
          </Button>
          <Button variant="outline" className="h-10">
            <Users className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Online Team Members */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Online Now ({teamMembers.filter(m => m.status === 'online').length})
          </h4>
          
          <div className="flex -space-x-2">
            {teamMembers
              .filter(member => member.status === 'online')
              .slice(0, 5)
              .map((member) => (
                <div key={member.id} className="relative">
                  <Avatar className="w-8 h-8 border-2 border-background">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border border-background" />
                </div>
              ))}
            {teamMembers.filter(m => m.status === 'online').length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs text-muted-foreground">
                +{teamMembers.filter(m => m.status === 'online').length - 5}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;