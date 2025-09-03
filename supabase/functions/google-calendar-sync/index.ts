import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string; timeZone?: string }
  end: { dateTime?: string; date?: string; timeZone?: string }
  location?: string
  attendees?: Array<{ email: string; displayName?: string; responseStatus: string }>
  hangoutLink?: string
  conferenceData?: {
    conferenceSolution?: { name: string }
    entryPoints?: Array<{ uri: string; entryPointType: string }>
  }
  status: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, profile_id, calendar_id, timeMin, timeMax } = await req.json()

    // Get active Google integration
    const { data: integration } = await supabaseClient
      .from('google_integrations')
      .select('*')
      .eq('profile_id', profile_id)
      .eq('is_active', true)
      .single()

    if (!integration) {
      return new Response(JSON.stringify({ error: 'No active Google integration found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if token needs refresh
    let accessToken = integration.access_token
    if (new Date(integration.expires_at) <= new Date()) {
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: integration.refresh_token,
          grant_type: 'refresh_token'
        })
      })

      const refreshData = await refreshResponse.json()
      if (refreshData.error) {
        return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      accessToken = refreshData.access_token
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000)
      
      await supabaseClient
        .from('google_integrations')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt.toISOString()
        })
        .eq('id', integration.id)
    }

    if (action === 'sync_calendars') {
      // Fetch Google calendars
      const calendarsResponse = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const calendarsData = await calendarsResponse.json()

      if (calendarsData.error) {
        return new Response(JSON.stringify({ error: calendarsData.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Sync calendars to database
      const calendarsToSync = calendarsData.items.map((gcal: any) => ({
        organization_id: (await supabaseClient
          .from('profiles')
          .select('organization_id')
          .eq('id', profile_id)
          .single()).data?.organization_id,
        owner_id: profile_id,
        name: gcal.summary,
        description: gcal.description || null,
        color: gcal.backgroundColor || '#3b82f6',
        type: 'google',
        google_calendar_id: gcal.id,
        sync_enabled: gcal.selected !== false,
        external_calendar_id: gcal.id
      }))

      const { data: syncedCalendars, error: syncError } = await supabaseClient
        .from('calendars')
        .upsert(calendarsToSync, { 
          onConflict: 'google_calendar_id',
          ignoreDuplicates: false 
        })
        .select()

      if (syncError) {
        console.error('Calendar sync error:', syncError)
        return new Response(JSON.stringify({ error: 'Failed to sync calendars' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ calendars: syncedCalendars }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'sync_events') {
      // Get calendar info
      const { data: calendar } = await supabaseClient
        .from('calendars')
        .select('*')
        .eq('id', calendar_id)
        .single()

      if (!calendar?.google_calendar_id) {
        return new Response(JSON.stringify({ error: 'Calendar not found or not a Google calendar' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Fetch events from Google Calendar
      const eventsUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/${calendar.google_calendar_id}/events`)
      eventsUrl.searchParams.set('timeMin', timeMin || new Date().toISOString())
      if (timeMax) eventsUrl.searchParams.set('timeMax', timeMax)
      eventsUrl.searchParams.set('singleEvents', 'true')
      eventsUrl.searchParams.set('orderBy', 'startTime')

      const eventsResponse = await fetch(eventsUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      const eventsData = await eventsResponse.json()

      if (eventsData.error) {
        return new Response(JSON.stringify({ error: eventsData.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Convert Google events to our format
      const eventsToSync = eventsData.items?.map((gevent: GoogleEvent) => {
        const startDateTime = gevent.start.dateTime || gevent.start.date + 'T00:00:00'
        const endDateTime = gevent.end.dateTime || gevent.end.date + 'T23:59:59'
        
        return {
          calendar_id: calendar.id,
          created_by: profile_id,
          title: gevent.summary || 'Untitled Event',
          description: gevent.description || null,
          start_at: startDateTime,
          end_at: endDateTime,
          all_day: !gevent.start.dateTime,
          location: gevent.location || null,
          online_join_url: gevent.hangoutLink || gevent.conferenceData?.entryPoints?.[0]?.uri || null,
          google_event_id: gevent.id,
          external_event_id: gevent.id,
          source: 'google',
          status: gevent.status === 'cancelled' ? 'cancelled' : 'confirmed',
          timezone: gevent.start.timeZone || 'UTC',
          last_synced_at: new Date().toISOString(),
          sync_status: 'synced'
        }
      }) || []

      // Sync events to database
      const { data: syncedEvents, error: eventsError } = await supabaseClient
        .from('events')
        .upsert(eventsToSync, { 
          onConflict: 'google_event_id',
          ignoreDuplicates: false 
        })
        .select()

      if (eventsError) {
        console.error('Events sync error:', eventsError)
        return new Response(JSON.stringify({ error: 'Failed to sync events' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update calendar last sync timestamp
      await supabaseClient
        .from('calendars')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', calendar_id)

      return new Response(JSON.stringify({ events: syncedEvents }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Google Calendar sync error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})