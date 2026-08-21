import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? serviceRoleKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userId, location } = await req.json() as {
      userId: string
      location: { lat: number; lng: number }
    }

    if (!userId || !location) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, location' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the point is inside any campus building boundary using PostGIS
    const { data: buildings, error: geoError } = await adminClient.rpc('check_point_in_buildings', {
      check_lng: location.lng,
      check_lat: location.lat,
    })

    // Fallback: if the RPC doesn't exist, try a direct query approach
    let matchedBuilding: { id: string; name: string } | null = null

    if (geoError || !buildings || buildings.length === 0) {
      // Attempt direct query with ST_Within
      const { data: directMatch } = await adminClient
        .from('campus_buildings')
        .select('id, name, boundary')
        .not('boundary', 'is', null)

      if (directMatch && directMatch.length > 0) {
        // Use RPC-based ST_DWithin as proximity check (within ~50 meters)
        const { data: nearbyBuildings } = await adminClient.rpc('find_nearby_buildings', {
          check_lng: location.lng,
          check_lat: location.lat,
          radius_meters: 50,
        })

        if (nearbyBuildings && nearbyBuildings.length > 0) {
          matchedBuilding = { id: nearbyBuildings[0].id, name: nearbyBuildings[0].name }
        }
      }
    } else {
      matchedBuilding = { id: buildings[0].id, name: buildings[0].name }
    }

    if (!matchedBuilding) {
      // User is not inside any building
      return new Response(
        JSON.stringify({
          insideBuilding: false,
          buildingName: null,
          attendanceMarked: false,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // User is inside a building — check timetable for current slot
    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getDay()]
    const currentTime = now.toTimeString().slice(0, 8) // HH:MM:SS
    const todayDate = now.toISOString().split('T')[0] // YYYY-MM-DD

    const { data: timetableSlot } = await adminClient
      .from('timetable_slots')
      .select('id, subject, room')
      .eq('user_id', userId)
      .eq('day', currentDay)
      .eq('building', matchedBuilding.name)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)
      .limit(1)
      .maybeSingle()

    let attendanceMarked = false

    if (timetableSlot) {
      // Upsert attendance record
      const { error: attendanceError } = await adminClient
        .from('attendance')
        .upsert(
          {
            user_id: userId,
            date: todayDate,
            status: 'present',
            method: 'geofence',
            building: matchedBuilding.name,
            timetable_slot_id: timetableSlot.id,
          },
          { onConflict: 'user_id,date,timetable_slot_id' }
        )

      if (!attendanceError) {
        attendanceMarked = true
      }
    }

    // Update user location
    const locationPoint = `POINT(${location.lng} ${location.lat})`
    await adminClient
      .from('users')
      .update({
        current_location: locationPoint,
        location_reason: 'attendance',
      })
      .eq('id', userId)

    return new Response(
      JSON.stringify({
        insideBuilding: true,
        buildingName: matchedBuilding.name,
        attendanceMarked,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
