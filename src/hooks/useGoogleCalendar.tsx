import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface GoogleIntegration {
  id: string;
  google_email: string;
  is_active: boolean;
  expires_at: string;
}

export function useGoogleCalendar() {
  const [integration, setIntegration] = useState<GoogleIntegration | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      checkGoogleIntegration();
    }
  }, [profile]);

  const checkGoogleIntegration = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('google_integrations')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Google integration:', error);
        return;
      }

      if (data) {
        setIntegration(data);
        setIsConnected(true);
        
        // Check if token is expired
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        
        if (expiresAt <= now) {
          toast({
            title: "Token Expired",
            description: "Your Google Calendar connection has expired. Please reconnect.",
            variant: "destructive"
          });
          setIsConnected(false);
        }
      } else {
        setIntegration(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking Google integration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncGoogleCalendars = async () => {
    if (!profile || !isConnected) return;

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'sync_calendars',
          profile_id: profile.id
        }
      });

      if (error) throw error;

      toast({
        title: "Calendars Synced",
        description: `Successfully synced ${data.calendars?.length || 0} Google calendars.`
      });

      return data.calendars;
    } catch (error) {
      console.error('Calendar sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync Google calendars. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const syncCalendarEvents = async (calendarId: string, timeMin?: string, timeMax?: string) => {
    if (!profile || !isConnected) return;

    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-sync', {
        body: {
          action: 'sync_events',
          profile_id: profile.id,
          calendar_id: calendarId,
          timeMin,
          timeMax
        }
      });

      if (error) throw error;

      toast({
        title: "Events Synced",
        description: `Successfully synced ${data.events?.length || 0} events.`
      });

      return data.events;
    } catch (error) {
      console.error('Events sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync calendar events. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    integration,
    isConnected,
    isLoading,
    checkGoogleIntegration,
    syncGoogleCalendars,
    syncCalendarEvents
  };
}