import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Forward,
  MoreHorizontal,
  Paperclip,
  Clock
} from 'lucide-react';

interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  priority: 'high' | 'normal' | 'low';
  avatar?: string;
}

const EmailInbox = () => {
  const [emails] = useState<Email[]>([
    {
      id: '1',
      sender: 'Sarah Wilson',
      senderEmail: 'sarah@company.com',
      subject: 'Q4 Marketing Campaign Review',
      preview: 'Hi team, I wanted to share the latest updates on our Q4 marketing campaign performance...',
      time: '2 hours ago',
      isRead: false,
      isStarred: true,
      hasAttachment: true,
      priority: 'high'
    },
    {
      id: '2',
      sender: 'Mike Chen',
      senderEmail: 'mike@company.com',
      subject: 'Meeting notes from yesterday',
      preview: 'Thanks for the productive meeting yesterday. Here are the key takeaways and action items...',
      time: '4 hours ago',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      priority: 'normal'
    },
    {
      id: '3',
      sender: 'Client Portal',
      senderEmail: 'noreply@client.com',
      subject: 'New project submission',
      preview: 'A new project has been submitted to your dashboard and requires immediate attention...',
      time: '6 hours ago',
      isRead: false,
      isStarred: false,
      hasAttachment: true,
      priority: 'high'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = emails.filter(email => !email.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-destructive';
      case 'low': return 'border-l-success';
      default: return 'border-l-primary';
    }
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-custom-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Email Inbox
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface border-border"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {emails.map((email) => (
            <div
              key={email.id}
              className={`p-4 border-b border-border hover:bg-surface-hover transition-colors cursor-pointer border-l-4 ${getPriorityColor(email.priority)} ${
                !email.isRead ? 'bg-surface/50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={email.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {email.sender.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${!email.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {email.sender}
                      </span>
                      {email.hasAttachment && (
                        <Paperclip className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {email.time}
                      </span>
                      {email.isStarred && (
                        <Star className="w-4 h-4 text-warning fill-current" />
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-1 ${!email.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {email.subject}
                  </p>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {email.preview}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Forward className="w-3 h-3 mr-1" />
                      Forward
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
            View All Emails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailInbox;