import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GoogleIntegrationProps {
  onCalendarsUpdated: () => void;
}

export function GoogleIntegration({ onCalendarsUpdated }: GoogleIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const connectToGoogle = async () => {
    if (!profile) return;
    
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { profile_id: profile.id }
      });

      if (error) throw error;

      // Open OAuth URL in new window
      const authWindow = window.open(data.auth_url, 'google-auth', 'width=500,height=600');
      
      // Poll for window closure
      const pollTimer = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(pollTimer);
          setIsConnecting(false);
          checkConnectionStatus();
        }
      }, 1000);

    } catch (error) {
      console.error('Google connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Calendar. Please try again.",
        variant: "destructive"
      });
      setIsConnecting(false);
    }
  };

  const checkConnectionStatus = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('google_integrations')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setIsConnected(true);
        toast({
          title: "Connected!",
          description: "Successfully connected to Google Calendar."
        });
      }
    } catch (error) {
      console.error('Connection status check failed:', error);
    }
  };

  const syncCalendars = async () => {
    if (!profile) return;

    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'sync_calendars',
          profile_id: profile.id
        }
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: `Synced ${data.calendars?.length || 0} calendars from Google.`
      });
      
      onCalendarsUpdated();
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync Google calendars. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4" />
          Google Calendar Integration
          {isConnected && <Badge variant="secondary">Connected</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isConnected ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Connect your Google Calendar to sync events and calendars.
            </p>
            <Button 
              onClick={connectToGoogle}
              disabled={isConnecting}
              className="w-full"
              size="sm"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Your Google Calendar is connected and ready to sync.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={syncCalendars}
                disabled={isSyncing}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}