import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  MessageSquare, 
  CheckSquare, 
  Calendar, 
  FileText, 
  User, 
  Hash,
  Clock,
  ArrowRight
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'message' | 'file' | 'user' | 'channel' | 'meeting';
  timestamp?: string;
  metadata?: any;
}

interface GlobalSearchProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onNavigate?: (section: string, id?: string) => void;
}

export default function GlobalSearch({ open, setOpen, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { profile } = useAuth();

  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'task', label: 'Tasks', icon: CheckSquare },
    { id: 'message', label: 'Messages', icon: MessageSquare },
    { id: 'file', label: 'Files', icon: FileText },
    { id: 'user', label: 'People', icon: User },
    { id: 'meeting', label: 'Meetings', icon: Calendar }
  ];

  useEffect(() => {
    if (!query.trim() || !profile?.organization_id) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      await performSearch(query, activeFilter);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, activeFilter, profile?.organization_id]);

  const performSearch = async (searchQuery: string, filter: string) => {
    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search tasks
      if (filter === 'all' || filter === 'task') {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, description, status, created_at')
          .eq('organization_id', profile?.organization_id)
          .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`)
          .limit(5);

        tasks?.forEach(task => {
          searchResults.push({
            id: task.id,
            title: task.title,
            description: task.description,
            type: 'task',
            timestamp: task.created_at,
            metadata: { status: task.status }
          });
        });
      }

      // Search messages
      if (filter === 'all' || filter === 'message') {
        const { data: messages } = await supabase
          .from('messages')
          .select(`
            id, content, created_at,
            channels(name),
            profiles!messages_sender_id_fkey(full_name)
          `)
          .textSearch('content', searchQuery)
          .limit(5);

        messages?.forEach(message => {
          searchResults.push({
            id: message.id,
            title: message.content.substring(0, 50) + '...',
            description: `in #${message.channels?.name} by ${message.profiles?.full_name}`,
            type: 'message',
            timestamp: message.created_at
          });
        });
      }

      // Search files
      if (filter === 'all' || filter === 'file') {
        const { data: files } = await supabase
          .from('files')
          .select('id, name, file_type, created_at, profiles!files_uploaded_by_fkey(full_name)')
          .eq('organization_id', profile?.organization_id)
          .ilike('name', `%${searchQuery}%`)
          .limit(5);

        files?.forEach(file => {
          searchResults.push({
            id: file.id,
            title: file.name,
            description: `${file.file_type} • uploaded by ${file.profiles?.full_name}`,
            type: 'file',
            timestamp: file.created_at
          });
        });
      }

      // Search users
      if (filter === 'all' || filter === 'user') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, avatar_url')
          .eq('organization_id', profile?.organization_id)
          .neq('id', profile?.id)
          .or(`full_name.ilike.%${searchQuery}%, email.ilike.%${searchQuery}%`)
          .limit(5);

        users?.forEach(user => {
          searchResults.push({
            id: user.id,
            title: user.full_name || 'Unknown User',
            description: `${user.role} • ${user.email}`,
            type: 'user',
            metadata: { avatar_url: user.avatar_url, role: user.role }
          });
        });
      }

      // Search meetings
      if (filter === 'all' || filter === 'meeting') {
        const { data: meetings } = await supabase
          .from('meetings')
          .select('id, title, description, start_time')
          .eq('organization_id', profile?.organization_id)
          .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`)
          .limit(5);

        meetings?.forEach(meeting => {
          searchResults.push({
            id: meeting.id,
            title: meeting.title,
            description: meeting.description,
            type: 'meeting',
            timestamp: meeting.start_time
          });
        });
      }

      // Sort results by relevance and recency
      searchResults.sort((a, b) => {
        const aRelevance = a.title.toLowerCase().indexOf(searchQuery.toLowerCase());
        const bRelevance = b.title.toLowerCase().indexOf(searchQuery.toLowerCase());
        
        if (aRelevance !== bRelevance) {
          return aRelevance === -1 ? 1 : bRelevance === -1 ? -1 : aRelevance - bRelevance;
        }
        
        return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'message': return MessageSquare;
      case 'file': return FileText;
      case 'user': return User;
      case 'meeting': return Calendar;
      default: return Hash;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'task':
        onNavigate?.('tasks', result.id);
        break;
      case 'message':
        onNavigate?.('chat', result.id);
        break;
      case 'file':
        onNavigate?.('files', result.id);
        break;
      case 'meeting':
        onNavigate?.('calendar', result.id);
        break;
      default:
        break;
    }
    setOpen(false);
    setQuery('');
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 bg-gradient-card border-0 shadow-brand">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search everything in your workspace..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0"
              autoFocus
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                {query ? 'No results found' : 'Start typing to search...'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result) => {
                const Icon = getResultIcon(result.type);
                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-hover cursor-pointer transition-colors group"
                  >
                    {result.type === 'user' ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={result.metadata?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {result.title.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{result.title}</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {result.type}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </p>
                      )}
                      {result.timestamp && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(result.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>

                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-muted rounded">↵</kbd> to open, <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> to close</span>
            <span>{results.length} results</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}