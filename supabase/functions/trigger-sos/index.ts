import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface LocationInput {
  lat: number
  lng: number
  accuracy: number
}

interface ResolvedLocation {
  lat: number
  lng: number
  accuracy: number
  source: 'gps' | 'gps_with_timetable_confirmed' | 'gps_with_timetable_mismatch' | 'gps_with_outing_confirmed' | 'gps_with_outing_mismatch' | 'last_known'
  hint?: {
    type: 'timetable' | 'outing'
    building?: string
    room?: string
    subject?: string
    destination?: string
    confirmed: boolean // true = hint location is WITHIN GPS radius
    note: string       // human-readable context for the guard
  }
}

/**
 * Cross-validates GPS with timetable/outing data.
 * GPS ALWAYS provides the primary location (even if inaccurate).
 * Timetable/outing are SECONDARY HINTS validated against GPS radius.
 *
 * Resolution chain:
 * 1. GPS accuracy < 50m → high confidence, use GPS directly
 * 2. GPS accuracy >= 50m → cross-validate:
 *    a. Timetable building WITHIN GPS circle? → confirmed hint
 *    b. Timetable building OUTSIDE GPS circle? → mismatch (student not where expected)
 *    c. No timetable match → check active outing request
 *    d. Outing destination WITHIN GPS circle? → confirmed hint
 *    e. Outing destination OUTSIDE GPS circle? → mismatch
 * 3. Guard receives: GPS area + hint (if any) → makes own judgment
 */
async function resolveLocationWithCrossValidation(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  location: LocationInput
): Promise<ResolvedLocation> {
  // GPS always provides the primary coordinates
  const result: ResolvedLocation = {
    lat: location.lat,
    lng: location.lng,
    accuracy: location.accuracy,
    source: 'gps',
  }

  // If GPS is highly accurate, no need for hints
  if (location.accuracy < 50) {
    return result
  }

  // --- GPS is broad (>=50m). Cross-validate with timetable ---
  const now = new Date()
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = days[now.getDay()].toLowerCase()
  const currentTime = now.toTimeString().slice(0, 8) // HH:MM:SS

  const { data: slot } = await adminClient
    .from('timetable_slots')
    .select('building, room, subject')
    .eq('user_id', userId)
    .ilike('day', currentDay)
    .lte('start_time', currentTime)
    .gte('end_time', currentTime)
    .limit(1)
    .maybeSingle()

  if (slot?.building) {
    // Found a timetable match — check if building is within GPS accuracy radius
    const { data: withinCheck } = await adminClient.rpc('check_location_within_radius', {
      p_building_name: slot.building,
      p_point_lng: location.lng,
      p_point_lat: location.lat,
      p_radius_meters: location.accuracy, // use GPS accuracy as the radius
    })

    const isConfirmed = withinCheck === true

    result.source = isConfirmed ? 'gps_with_timetable_confirmed' : 'gps_with_timetable_mismatch'
    result.hint = {
      type: 'timetable',
      building: slot.building,
      room: slot.room,
      subject: slot.subject,
      confirmed: isConfirmed,
      note: isConfirmed
        ? `Likely in ${slot.building}, ${slot.room} (scheduled for ${slot.subject}, confirmed within GPS radius)`
        : `Scheduled at ${slot.building}, ${slot.room} for ${slot.subject}, but GPS suggests student is elsewhere — possible safety concern`,
    }

    return result
  }

  // --- No timetable match. Check active outing request ---
  const { data: outing } = await adminClient.rpc('find_active_outing', {
    p_student_id: userId,
    p_sos_point: `POINT(${location.lng} ${location.lat})`,
    p_radius_meters: location.accuracy > 500 ? location.accuracy : 500, // minimum 500m radius for outing check
  })

  if (outing && outing.length > 0) {
    const activeOuting = outing[0]

    result.source = activeOuting.is_within_radius
      ? 'gps_with_outing_confirmed'
      : 'gps_with_outing_mismatch'
    result.hint = {
      type: 'outing',
      destination: activeOuting.destination_name,
      confirmed: activeOuting.is_within_radius,
      note: activeOuting.is_within_radius
        ? `Student has approved outing to ${activeOuting.destination_name} (GPS confirms nearby)`
        : `Student has approved outing to ${activeOuting.destination_name}, but GPS suggests they are NOT near that destination`,
    }

    return result
  }

  // --- No timetable, no outing. GPS is all we have ---
  result.source = 'last_known'
  return result
}

// ============================================================
// MAIN HANDLER
// ============================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const { level, location } = await req.json() as {
      level: 'campus' | 'police'
      location: LocationInput
    }

    if (!level || !location?.lat || !location?.lng || location.accuracy === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: level, location {lat, lng, accuracy}' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // --- Step 1: Resolve location with cross-validation ---
    const resolved = await resolveLocationWithCrossValidation(adminClient, user.id, location)

    // --- Step 2: Update user distress state (always use GPS coords as primary) ---
    const locationPoint = `POINT(${location.lng} ${location.lat})`
    await adminClient
      .from('users')
      .update({
        is_in_distress: true,
        distress_level: level,
        current_location: locationPoint,
        location_accuracy: location.accuracy,
        location_reason: 'sos',
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // --- Step 3: Create incident ---
    const { data: incident, error: incidentError } = await adminClient
      .from('incidents')
      .insert({
        reported_by: user.id,
        sos_level: level,
        status: 'reported',
        location: locationPoint,
        location_accuracy: location.accuracy,
        location_source: resolved.source.startsWith('gps_with_timetable')
          ? 'timetable_fallback'
          : resolved.source.startsWith('gps_with_outing')
            ? 'last_known' // schema doesn't have outing type, use last_known
            : resolved.source === 'last_known'
              ? 'last_known'
              : 'gps',
        fallback_building: resolved.hint?.building ?? null,
        fallback_room: resolved.hint?.room ?? null,
        fallback_subject: resolved.hint?.subject ?? null,
        offline_triggered: false,
      })
      .select('id')
      .single()

    if (incidentError || !incident) {
      throw new Error(`Failed to create incident: ${incidentError?.message}`)
    }

    // --- Step 4: Build response ---
    const responseBody: Record<string, unknown> = {
      incidentId: incident.id,
      locationSource: resolved.source,
      gpsLocation: { lat: location.lat, lng: location.lng, accuracy: location.accuracy },
    }

    if (resolved.hint) {
      responseBody.locationHint = resolved.hint
    }

    // --- Step 5: Dispatch ---
    if (level === 'campus') {
      // Find nearest available guard using PostGIS
      const { data: guards } = await adminClient.rpc('find_nearest_responder', {
        incident_lng: location.lng, // always use GPS for dispatch distance calc
        incident_lat: location.lat,
        responder_limit: 3,
      })

      if (guards && guards.length > 0) {
        const nearestGuard = guards[0]
        await adminClient
          .from('incidents')
          .update({ assigned_to: nearestGuard.id, status: 'assigned' })
          .eq('id', incident.id)

        responseBody.assignedGuard = {
          id: nearestGuard.id,
          name: nearestGuard.name,
          phone: nearestGuard.phone,
          distanceMeters: nearestGuard.distance_meters,
        }
        // Also return backup guards
        responseBody.backupGuards = guards.slice(1).map((g: any) => ({
          id: g.id,
          name: g.name,
          phone: g.phone,
          distanceMeters: g.distance_meters,
        }))
      } else {
        // Fallback: direct query if RPC not available
        const { data: fallbackGuards } = await adminClient
          .from('users')
          .select('id, name, phone')
          .in('role', ['guard', 'volunteer'])
          .eq('is_available', true)
          .limit(3)

        if (fallbackGuards && fallbackGuards.length > 0) {
          await adminClient
            .from('incidents')
            .update({ assigned_to: fallbackGuards[0].id, status: 'assigned' })
            .eq('id', incident.id)

          responseBody.assignedGuard = {
            id: fallbackGuards[0].id,
            name: fallbackGuards[0].name,
            phone: fallbackGuards[0].phone,
          }
        } else {
          responseBody.assignedGuard = null
          responseBody.warning = 'No available guards found — escalation recommended'
        }
      }
    } else if (level === 'police') {
      // Level 2: Notify ALL available guards
      const { data: allGuards } = await adminClient
        .from('users')
        .select('id, name, phone')
        .in('role', ['guard', 'volunteer'])
        .eq('is_available', true)

      if (allGuards && allGuards.length > 0) {
        await adminClient
          .from('incidents')
          .update({
            assigned_to: allGuards[0].id,
            status: 'assigned',
            escalated_at: new Date().toISOString(),
          })
          .eq('id', incident.id)

        responseBody.allGuards = allGuards.map((g) => ({
          id: g.id,
          name: g.name,
          phone: g.phone,
        }))
        responseBody.allGuardsNotified = allGuards.length
      } else {
        responseBody.allGuards = []
        responseBody.allGuardsNotified = 0
        responseBody.warning = 'No available guards found'
      }
    }

    return new Response(JSON.stringify(responseBody), {
      status: 200,
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
