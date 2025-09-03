import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Hash, Users, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Channel {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    full_name: string;
    avatar_url?: string;
  };
}

export default function RealTimeChat() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!profile?.organization_id) return;

    fetchChannels();
  }, [profile]);

  useEffect(() => {
    if (!activeChannel) return;

    fetchMessages();
    
    // Subscribe to real-time messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${activeChannel}`
        },
        (payload) => {
          // Fetch the full message with sender info
          fetchMessageWithSender(payload.new.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  const fetchChannels = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('name');

      if (error) throw error;
      
      setChannels(data || []);
      if (data && data.length > 0 && !activeChannel) {
        setActiveChannel(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: "Error",
        description: "Failed to load channels",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeChannel) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender:profiles(full_name, avatar_url)
        `)
        .eq('channel_id', activeChannel)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchMessageWithSender = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender:profiles(full_name, avatar_url)
        `)
        .eq('id', messageId)
        .single();

      if (error) throw error;
      if (data) {
        setMessages(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error fetching new message:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannel || !profile) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: activeChannel,
          sender_id: profile.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const createChannel = async () => {
    const channelName = prompt('Enter channel name:');
    if (!channelName || !profile?.organization_id) return;

    try {
      const { error } = await supabase
        .from('channels')
        .insert({
          organization_id: profile.organization_id,
          name: channelName,
          created_by: profile.id
        });

      if (error) throw error;
      fetchChannels();
      toast({
        title: "Success",
        description: "Channel created successfully",
      });
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading channels...</div>;
  }

  return (
    <div className="flex h-full bg-background">
      {/* Channels Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Channels</h3>
            <Button size="sm" variant="ghost" onClick={createChannel}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {channels.map((channel) => (
              <Button
                key={channel.id}
                variant={activeChannel === channel.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveChannel(channel.id)}
              >
                <Hash className="mr-2 h-4 w-4" />
                {channel.name}
                {channel.is_private && (
                  <Badge variant="secondary" className="ml-auto">
                    Private
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {activeChannel ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center">
              <Hash className="mr-2 h-5 w-5" />
              <h2 className="font-semibold">
                {channels.find(c => c.id === activeChannel)?.name}
              </h2>
              <div className="ml-auto flex items-center text-sm text-muted-foreground">
                <Users className="mr-1 h-4 w-4" />
                {messages.length} messages
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.avatar_url} />
                    <AvatarFallback>
                      {message.sender.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {message.sender.full_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1 break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t bg-card">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${channels.find(c => c.id === activeChannel)?.name}`}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium">No channels available</h3>
            <p className="text-muted-foreground">Create a channel to start chatting</p>
            <Button onClick={createChannel} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create Channel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}