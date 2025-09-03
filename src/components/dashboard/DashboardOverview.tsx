import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import QuickActions from './QuickActions';
import { AnalyticsChart } from './AnalyticsChart';
import { 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  Users, 
  Clock,
  ArrowRight,
  TrendingUp,
  Bell,
  Video,
  Phone,
  CheckCircle,
  AlertCircle,
  Plus,
  BarChart3,
  Activity
} from 'lucide-react';

const stats = [
  {
    title: "Active Conversations",
    value: "24",
    change: "+12%",
    icon: MessageSquare,
    color: "text-primary"
  },
  {
    title: "Pending Tasks",
    value: "18",
    change: "-8%",
    icon: CheckSquare,
    color: "text-warning"
  },
  {
    title: "Team Members",
    value: "156",
    change: "+5%",
    icon: Users,
    color: "text-success"
  },
  {
    title: "Upcoming Events",
    value: "7",
    change: "+2",
    icon: Calendar,
    color: "text-secondary"
  }
];

const recentActivity = [
  { user: "Sarah Johnson", action: "completed task", item: "Update landing page", time: "2 min ago" },
  { user: "Mike Chen", action: "joined channel", item: "#product-design", time: "5 min ago" },
  { user: "Emma Wilson", action: "uploaded file", item: "Q4-Report.pdf", time: "12 min ago" },
  { user: "Alex Rodriguez", action: "scheduled meeting", item: "Team Standup", time: "18 min ago" },
];

const upcomingTasks = [
  { title: "Review marketing campaign", priority: "high", deadline: "Today, 3:00 PM", completed: false },
  { title: "Client presentation prep", priority: "medium", deadline: "Today, 4:30 PM", completed: false },
  { title: "Update documentation", priority: "low", deadline: "Today, 6:00 PM", completed: true },
  { title: "Team standup meeting", priority: "high", deadline: "Today, 9:00 AM", completed: true },
  { title: "Code review", priority: "medium", deadline: "Today, 2:00 PM", completed: false },
];

const todaysMeetings = [
  {
    id: '1',
    title: 'Daily Standup',
    time: '9:00 AM',
    duration: '30 min',
    attendees: [
      { name: 'Sarah Wilson', avatar: '', status: 'confirmed' },
      { name: 'Mike Chen', avatar: '', status: 'confirmed' },
      { name: 'Emma Johnson', avatar: '', status: 'pending' }
    ],
    type: 'video' as const,
    status: 'upcoming' as const
  },
  {
    id: '2',
    title: 'Client Presentation',
    time: '2:00 PM',
    duration: '60 min',
    attendees: [
      { name: 'Alex Rodriguez', avatar: '', status: 'confirmed' },
      { name: 'Lisa Park', avatar: '', status: 'confirmed' }
    ],
    type: 'video' as const,
    status: 'upcoming' as const
  }
];

const urgentChats = [
  {
    id: '1',
    sender: 'Sarah Wilson',
    message: 'Can we discuss the new design requirements?',
    time: '5 min ago',
    unread: 3,
    channel: '#design-team',
    priority: 'high'
  },
  {
    id: '2',
    sender: 'Project Team',
    message: 'Deadline moved to tomorrow, please update tasks',
    time: '12 min ago',
    unread: 1,
    channel: '#project-alpha',
    priority: 'urgent'
  },
  {
    id: '3',
    sender: 'Mike Chen',
    message: 'Code review completed, ready for deployment',
    time: '18 min ago',
    unread: 0,
    channel: '#development',
    priority: 'normal'
  }
];

export default function DashboardOverview() {
  const todaysTasks = upcomingTasks.filter(task => task.deadline.includes('Today'));
  const pendingChats = urgentChats.filter(chat => chat.unread > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Good morning, Team! 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your team today.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-gradient-brand hover:opacity-90 hidden sm:flex">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button size="sm" className="bg-gradient-brand hover:opacity-90 sm:hidden">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 lg:p-6 bg-gradient-card border-0 shadow-custom-md hover:shadow-custom-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-xl lg:text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-3 h-3 text-success mr-1" />
                    <span className="text-xs text-success font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-2 lg:p-3 rounded-lg bg-accent ${stat.color}`}>
                  <Icon className="w-4 h-4 lg:w-6 lg:h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Today's Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Today's Meetings */}
        <Card className="bg-gradient-card border-0 shadow-custom-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Today's Meetings
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                {todaysMeetings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysMeetings.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No meetings today</p>
              </div>
            ) : (
              todaysMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary rounded-full"></div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{meeting.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meeting.time} ({meeting.duration})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {meeting.attendees.slice(0, 2).map((attendee, idx) => (
                        <Avatar key={idx} className="w-6 h-6 border border-background">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {attendee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button size="sm" variant="ghost" className="text-primary hover:bg-primary hover:text-primary-foreground">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create Meeting
            </Button>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card className="bg-gradient-card border-0 shadow-custom-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              Today's Tasks
              <Badge variant="secondary" className="bg-warning text-warning-foreground">
                {todaysTasks.filter(t => !t.completed).length} pending
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-6">
                <CheckSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tasks for today</p>
              </div>
            ) : (
              todaysTasks.map((task, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface-hover transition-colors">
                  <div className={`p-1 rounded-full ${task.completed ? 'bg-success' : 'bg-muted'}`}>
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-success-foreground" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.deadline}
                    </p>
                  </div>
                  <Badge 
                    variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </CardContent>
        </Card>

        {/* Urgent Chats */}
        <Card className="bg-gradient-card border-0 shadow-custom-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Urgent Chats
              {pendingChats.length > 0 && (
                <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
                  {pendingChats.reduce((sum, chat) => sum + chat.unread, 0)} unread
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentChats.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              urgentChats.slice(0, 4).map((chat) => (
                <div key={chat.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-surface-hover transition-colors cursor-pointer">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {chat.sender.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{chat.sender}</p>
                      <div className="flex items-center gap-2">
                        {chat.unread > 0 && (
                          <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{chat.channel}</p>
                    <p className="text-sm text-foreground line-clamp-2">{chat.message}</p>
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full mt-4">
              View All Chats
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid - Email and Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 columns on large screens */}
        <div className="xl:col-span-2">
          <Card className="p-6 bg-gradient-card border-0 shadow-custom-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-surface-hover transition-colors">
                  <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">{activity.item}</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Team Productivity"
          description="Tasks completed and focus score over time"
          type="line"
        />
        <AnalyticsChart
          title="Performance Trends"
          description="Monthly productivity and satisfaction metrics"
          type="area"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Weekly Activity"
          description="Tasks and meetings breakdown by day"
          type="bar"
        />
        <AnalyticsChart
          title="Project Status"
          description="Distribution of project statuses"
          type="pie"
        />
      </div>
    </div>
  );
}