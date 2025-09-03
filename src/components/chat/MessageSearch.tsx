import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, User, Hash, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';

interface MessageSearchProps {
  onClose: () => void;
  className?: string;
}

interface SearchResult {
  id: string;
  content: string;
  sender: {
    name: string;
    avatar?: string;
  };
  channel: {
    name: string;
    id: string;
  };
  timestamp: string;
  messageType: 'text' | 'file' | 'image' | 'link';
  fileUrl?: string;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ onClose, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    channel: '',
    sender: '',
    dateFrom: '',
    dateTo: '',
    messageType: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  // Mock search results for demonstration
  const mockSearch = async (searchQuery: string, searchFilters: typeof filters) => {
    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockResults: SearchResult[] = [
      {
        id: '1',
        content: `This is a sample message containing "${searchQuery}" for demonstration purposes.`,
        sender: { name: 'John Doe', avatar: 'https://via.placeholder.com/32' },
        channel: { name: 'general', id: '1' },
        timestamp: new Date().toISOString(),
        messageType: 'text',
      },
      {
        id: '2',
        content: `Another message with "${searchQuery}" in the content.`,
        sender: { name: 'Jane Smith', avatar: 'https://via.placeholder.com/32' },
        channel: { name: 'random', id: '2' },
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        messageType: 'text',
      },
      {
        id: '3',
        content: `File shared: document.pdf`,
        sender: { name: 'Bob Johnson', avatar: 'https://via.placeholder.com/32' },
        channel: { name: 'files', id: '3' },
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        messageType: 'file',
        fileUrl: 'https://example.com/document.pdf',
      },
    ];
    
    // Apply filters
    let filteredResults = mockResults;
    
    if (searchFilters.channel) {
      filteredResults = filteredResults.filter(r => 
        r.channel.name.toLowerCase().includes(searchFilters.channel.toLowerCase())
      );
    }
    
    if (searchFilters.sender) {
      filteredResults = filteredResults.filter(r => 
        r.sender.name.toLowerCase().includes(searchFilters.sender.toLowerCase())
      );
    }
    
    if (searchFilters.messageType) {
      filteredResults = filteredResults.filter(r => r.messageType === searchFilters.messageType);
    }
    
    setResults(filteredResults);
    setIsSearching(false);
  };

  useEffect(() => {
    if (debouncedQuery.trim()) {
      mockSearch(debouncedQuery, filters);
    } else {
      setResults([]);
    }
  }, [debouncedQuery, filters]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      channel: '',
      sender: '',
      dateFrom: '',
      dateTo: '',
      messageType: '',
    });
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'file': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'image': return <FileText className="w-4 h-4 text-green-500" />;
      case 'link': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Search Messages</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search messages, files, and links..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Channel
                  </label>
                  <Input
                    placeholder="Channel name"
                    value={filters.channel}
                    onChange={(e) => handleFilterChange('channel', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Sender
                  </label>
                  <Input
                    placeholder="Sender name"
                    value={filters.sender}
                    onChange={(e) => handleFilterChange('sender', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-medium text-muted-foreground">Type:</label>
                <select
                  value={filters.messageType}
                  onChange={(e) => handleFilterChange('messageType', e.target.value)}
                  className="h-8 px-2 text-sm border rounded bg-background"
                >
                  <option value="">All types</option>
                  <option value="text">Text</option>
                  <option value="file">File</option>
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                </select>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-hidden">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {result.sender.avatar ? (
                          <img
                            src={result.sender.avatar}
                            alt={result.sender.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{result.sender.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            <Hash className="w-3 h-3 mr-1" />
                            {result.channel.name}
                          </Badge>
                          {getMessageTypeIcon(result.messageType)}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(result.timestamp), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        
                        <div
                          className="text-sm text-foreground"
                          dangerouslySetInnerHTML={{
                            __html: highlightQuery(result.content, query)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : query ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Search className="w-8 h-8 mr-2" />
              No messages found for "{query}"
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Search className="w-8 h-8 mr-2" />
              Start typing to search messages
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {results.length > 0 ? `${results.length} result${results.length === 1 ? '' : 's'} found` : ''}
            </span>
            <span>Press Esc to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;
