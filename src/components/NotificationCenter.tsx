import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  Users, 
  AlertTriangle,
  Clock,
  X,
  Settings
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'task' | 'meeting' | 'mention' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
  sender?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New message from Sarah Wilson',
    description: 'Hey, can we discuss the new design requirements for the homepage?',
    time: '2 min ago',
    read: false,
    sender: 'Sarah Wilson',
    priority: 'high'
  },
  {
    id: '2',
    type: 'task',
    title: 'Task assigned to you',
    description: 'Update the user authentication flow documentation',
    time: '5 min ago',
    read: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'meeting',
    title: 'Meeting starting soon',
    description: 'Daily Standup meeting starts in 15 minutes',
    time: '15 min ago',
    read: true,
    priority: 'urgent'
  },
  {
    id: '4',
    type: 'mention',
    title: 'You were mentioned',
    description: 'Mike Chen mentioned you in #development channel',
    time: '30 min ago',
    read: false,
    sender: 'Mike Chen',
    priority: 'medium'
  },
  {
    id: '5',
    type: 'system',
    title: 'Weekly report available',
    description: 'Your team\'s weekly productivity report is ready to view',
    time: '1 hour ago',
    read: true,
    priority: 'low'
  }
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return MessageSquare;
    case 'task':
      return CheckSquare;
    case 'meeting':
      return Calendar;
    case 'mention':
      return Users;
    case 'system':
      return Settings;
    default:
      return Bell;
  }
};

const getPriorityColor = (priority: Notification['priority']) => {
  switch (priority) {
    case 'urgent':
      return 'text-destructive';
    case 'high':
      return 'text-warning';
    case 'medium':
      return 'text-primary';
    case 'low':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-custom-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={`group relative flex items-start gap-3 p-4 hover:bg-surface-hover transition-colors cursor-pointer ${
                          !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`p-2 rounded-full bg-accent ${getPriorityColor(notification.priority)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {notification.sender && (
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-xs bg-gradient-brand text-white">
                                    {notification.sender.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notification.time}
                              </span>
                            </div>
                            
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-4">
                <Button variant="outline" className="w-full text-sm">
                  View All Notifications
                </Button>
              </div>
            </>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}