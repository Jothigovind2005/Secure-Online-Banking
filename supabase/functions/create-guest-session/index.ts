import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Generate a unique guest session ID
    const sessionId = crypto.randomUUID()
    
    // Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Create a simple JWT-like token for guest sessions
    const guestToken = btoa(JSON.stringify({
      sessionId,
      expiresAt,
      isGuest: true,
      createdAt: new Date().toISOString()
    }))

    return new Response(
      JSON.stringify({
        sessionId,
        expiresAt,
        token: guestToken,
        message: 'Guest session created successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Create guest session error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create guest session' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})