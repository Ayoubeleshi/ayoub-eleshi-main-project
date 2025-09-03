import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  Clock,
  Plus,
  Filter,
  Inbox,
  Send,
  Edit3,
  RefreshCw,
  Settings,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  ChevronDown,
  Menu
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

const EmailSection = () => {
  const [emails] = useState<Email[]>([
    {
      id: '1',
      sender: 'Sarah Wilson',
      senderEmail: 'sarah@company.com',
      subject: 'Q4 Marketing Campaign Review',
      preview: 'Hi team, I wanted to share the latest updates on our Q4 marketing campaign performance. The results have been quite promising and I think we should discuss the next steps for Q1.',
      time: '10:30 AM',
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
      preview: 'Thanks for the productive meeting yesterday. Here are the key takeaways and action items that we discussed during our quarterly planning session.',
      time: '9:15 AM',
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
      preview: 'A new project has been submitted to your dashboard and requires immediate attention. Please review and provide feedback within 48 hours.',
      time: 'Yesterday',
      isRead: false,
      isStarred: false,
      hasAttachment: true,
      priority: 'high'
    },
    {
      id: '4',
      sender: 'Emma Rodriguez',
      senderEmail: 'emma@company.com',
      subject: 'Design system updates',
      preview: 'The new design system components are ready for review. I\'ve attached the updated style guide and component library for your feedback.',
      time: 'Nov 28',
      isRead: true,
      isStarred: true,
      hasAttachment: true,
      priority: 'normal'
    },
    {
      id: '5',
      sender: 'System Notification',
      senderEmail: 'system@company.com',
      subject: 'Weekly backup completed',
      preview: 'Your weekly system backup has been completed successfully. All data has been securely stored and verified.',
      time: 'Nov 27',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      priority: 'low'
    },
    {
      id: '6',
      sender: 'Jennifer Park',
      senderEmail: 'jennifer@company.com',
      subject: 'Budget approval needed',
      preview: 'The Q1 budget proposal is ready for your review and approval. Please take a look at the attached documents and let me know if you have any questions.',
      time: 'Nov 26',
      isRead: false,
      isStarred: false,
      hasAttachment: true,
      priority: 'high'
    },
    {
      id: '7',
      sender: 'David Kim',
      senderEmail: 'david@company.com',
      subject: 'Team lunch this Friday',
      preview: 'Hey everyone! Just wanted to confirm our team lunch this Friday at 12:30 PM. I made reservations at the new Italian place downtown.',
      time: 'Nov 25',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      priority: 'normal'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const unreadCount = emails.filter(email => !email.isRead).length;
  const starredCount = emails.filter(email => email.isStarred).length;

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: unreadCount, isActive: true },
    { id: 'starred', name: 'Starred', icon: Star, count: starredCount },
    { id: 'snoozed', name: 'Snoozed', icon: Clock, count: 0 },
    { id: 'sent', name: 'Sent', icon: Send, count: 0 },
    { id: 'drafts', name: 'Drafts', icon: FileText, count: 2 },
    { id: 'important', name: 'Important', icon: AlertCircle, count: 0 },
    { id: 'spam', name: 'Spam', icon: Archive, count: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0 },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-destructive';
      case 'low': return 'border-l-success';
      default: return 'border-l-primary';
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = selectedFolder === 'inbox' ||
                         (selectedFolder === 'starred' && email.isStarred) ||
                         (selectedFolder === 'sent') ||
                         (selectedFolder === 'drafts') ||
                         (selectedFolder === 'trash');
    
    return matchesSearch && matchesFolder;
  });

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmails(prev => 
      prev.includes(emailId) 
        ? prev.filter(id => id !== emailId)
        : [...prev, emailId]
    );
  };

  const selectAllEmails = () => {
    setSelectedEmails(selectedEmails.length === filteredEmails.length ? [] : filteredEmails.map(e => e.id));
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Gmail-style Header */}
      <div className="flex items-center gap-4 px-4 py-2 bg-background border-b border-border">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="shrink-0"
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" />
          <span className="text-xl text-foreground font-normal">Gmail</span>
        </div>
        
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search mail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface hover:bg-surface-hover focus:bg-background transition-colors rounded-full border-border"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Gmail-style Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-200 border-r border-border bg-background flex flex-col`}>
          <div className="p-4">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-full h-12 flex items-center justify-center gap-2">
              <Edit3 className="w-5 h-5" />
              {!sidebarCollapsed && "Compose"}
            </Button>
          </div>
          
          <div className="flex-1 px-2 space-y-1">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                className={`w-full justify-start rounded-r-full h-8 ${selectedFolder === folder.id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-surface'}`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <folder.icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="ml-3">{folder.name}</span>
                    {folder.count > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs bg-transparent">
                        {folder.count}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Gmail-style Email List */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background">
            <Checkbox 
              checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
              onCheckedChange={selectAllEmails}
            />
            
            <div className="flex items-center gap-1 ml-2">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Archive className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <AlertCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredEmails.length} of {emails.length}</span>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <Mail className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Your {selectedFolder} is empty</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No emails match your search' : 'No emails in this folder'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:shadow-sm transition-all cursor-pointer group ${
                    !email.isRead ? 'bg-background' : 'bg-background/50'
                  } ${selectedEmails.includes(email.id) ? 'bg-surface' : ''}`}
                  onClick={() => toggleEmailSelection(email.id)}
                >
                  <Checkbox 
                    checked={selectedEmails.includes(email.id)}
                    onCheckedChange={() => toggleEmailSelection(email.id)}
                    className="shrink-0"
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle star
                    }}
                  >
                    <Star className={`w-4 h-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                  </Button>
                  
                  <div className="flex-1 min-w-0 flex items-center gap-4">
                    <div className={`w-48 shrink-0 text-sm truncate ${!email.isRead ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {email.sender}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className={`text-sm truncate ${!email.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {email.subject}
                      </span>
                      <span className="text-sm text-muted-foreground flex-shrink-0">
                        - {email.preview}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      {email.hasAttachment && (
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="text-sm text-muted-foreground w-16 text-right">
                        {email.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSection;