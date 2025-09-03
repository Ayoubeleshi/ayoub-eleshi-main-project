import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const url = new URL(req.url)
    const { searchParams } = url
    
    // Handle OAuth callback
    if (searchParams.get('code')) {
      const code = searchParams.get('code')!
      const state = searchParams.get('state') // Contains user info
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-oauth`
        })
      })

      const tokens = await tokenResponse.json()
      
      if (tokens.error) {
        console.error('Token exchange error:', tokens.error)
        return new Response(JSON.stringify({ error: tokens.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })
      const userInfo = await userInfoResponse.json()

      // Decode state to get profile_id
      const { profile_id } = JSON.parse(decodeURIComponent(state))
      
      // Store tokens in database
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
      const { error: insertError } = await supabaseClient
        .from('google_integrations')
        .upsert({
          profile_id,
          google_email: userInfo.email,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          scope: tokens.scope?.split(' ') || ['https://www.googleapis.com/auth/calendar'],
          is_active: true
        })

      if (insertError) {
        console.error('Database insert error:', insertError)
        return new Response(JSON.stringify({ error: 'Failed to store tokens' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Redirect to success page
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}.lovable.app/dashboard?section=calendar&google_connected=true`
        }
      })
    }

    // Handle initial OAuth request
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    const { profile_id } = await req.json()
    
    authUrl.searchParams.set('client_id', Deno.env.get('GOOGLE_CLIENT_ID')!)
    authUrl.searchParams.set('redirect_uri', `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-oauth`)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    authUrl.searchParams.set('state', encodeURIComponent(JSON.stringify({ profile_id })))

    return new Response(JSON.stringify({ auth_url: authUrl.toString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Google OAuth error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})