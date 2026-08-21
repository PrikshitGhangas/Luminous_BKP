import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

/**
 * resolve-location Edge Function
 *
 * Cross-validates GPS with timetable/outing data.
 * GPS is ALWAYS the primary location — timetable/outing are hints, not replacements.
 *
 * POST /functions/v1/resolve-location
 * Body: { userId, location: { lat, lng, accuracy } }
 *
 * Returns:
 * - gpsLocation: the raw GPS coords (always returned)
 * - source: how the location was resolved
 * - hint: contextual info from timetable or outing (if applicable)
 *   - confirmed: true if hint location is WITHIN GPS accuracy radius
 *   - note: human-readable message for the guard
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { userId, location } = await req.json() as {
      userId: string
      location: { lat: number; lng: number; accuracy: number }
    }

    if (!userId || !location?.lat || !location?.lng || location.accuracy === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, location {lat, lng, accuracy}' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GPS is always the primary — return it regardless
    const response: Record<string, unknown> = {
      gpsLocation: { lat: location.lat, lng: location.lng, accuracy: location.accuracy },
    }

    // High accuracy GPS — no hints needed
    if (location.accuracy < 50) {
      response.source = 'gps'
      response.confidence = 'high'
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- GPS is broad. Try timetable cross-validation ---
    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getDay()]
    const currentTime = now.toTimeString().slice(0, 8)

    const { data: slot } = await adminClient
      .from('timetable_slots')
      .select('building, room, subject')
      .eq('user_id', userId)
      .eq('day', currentDay)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)
      .limit(1)
      .maybeSingle()

    if (slot?.building) {
      // Check if building is within GPS accuracy circle
      const { data: withinCheck } = await adminClient.rpc('check_location_within_radius', {
        p_building_name: slot.building,
        p_point_lng: location.lng,
        p_point_lat: location.lat,
        p_radius_meters: location.accuracy,
      })

      const confirmed = withinCheck === true

      response.source = confirmed ? 'gps_with_timetable_confirmed' : 'gps_with_timetable_mismatch'
      response.confidence = confirmed ? 'medium_high' : 'low'
      response.hint = {
        type: 'timetable',
        building: slot.building,
        room: slot.room,
        subject: slot.subject,
        confirmed,
        note: confirmed
          ? `Likely in ${slot.building}, ${slot.room} (scheduled for ${slot.subject}, within GPS radius)`
          : `Scheduled at ${slot.building} for ${slot.subject}, but GPS suggests student is elsewhere`,
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- No timetable match. Try active outing ---
    const { data: outing } = await adminClient.rpc('find_active_outing', {
      p_student_id: userId,
      p_sos_point: `POINT(${location.lng} ${location.lat})`,
      p_radius_meters: Math.max(location.accuracy, 500), // minimum 500m for outing
    })

    if (outing && outing.length > 0) {
      const o = outing[0]

      response.source = o.is_within_radius ? 'gps_with_outing_confirmed' : 'gps_with_outing_mismatch'
      response.confidence = o.is_within_radius ? 'medium' : 'low'
      response.hint = {
        type: 'outing',
        destination: o.destination_name,
        destinationCoords: { lat: o.destination_lat, lng: o.destination_lng },
        confirmed: o.is_within_radius,
        note: o.is_within_radius
          ? `Student has approved outing to ${o.destination_name} (GPS confirms nearby)`
          : `Student has approved outing to ${o.destination_name}, but GPS suggests they are NOT near that destination`,
      }

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // --- No timetable, no outing. GPS is all we have ---
    response.source = 'gps_only'
    response.confidence = 'low'
    response.hint = null

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
