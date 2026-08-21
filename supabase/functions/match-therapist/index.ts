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

    const { studentId, urgency, anonymous, triageSummary } = await req.json() as {
      studentId: string
      urgency: string
      anonymous: boolean
      triageSummary: string
    }

    if (!studentId || !urgency) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: studentId, urgency' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Query available therapists (not currently busy)
    const { data: availableTherapists, error: therapistError } = await adminClient
      .from('available_therapists_view')
      .select('*')
      .eq('currently_busy', false)

    if (therapistError) {
      throw new Error(`Failed to query therapists: ${therapistError.message}`)
    }

    if (!availableTherapists || availableTherapists.length === 0) {
      // No therapists available — create a queued session without assignment
      const { data: session, error: sessionError } = await adminClient
        .from('therapy_sessions')
        .insert({
          student_id: anonymous ? null : studentId,
          status: 'queued',
          urgency,
          anonymous: anonymous ?? false,
          triage_summary: triageSummary ?? null,
        })
        .select('id')
        .single()

      if (sessionError || !session) {
        throw new Error(`Failed to create session: ${sessionError?.message}`)
      }

      return new Response(
        JSON.stringify({
          sessionId: session.id,
          therapist: null,
          status: 'queued',
          message: 'No therapists are currently available. You have been added to the queue.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check therapist slot availability for current day/time
    const now = new Date()
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getDay()]
    const currentTime = now.toTimeString().slice(0, 8)

    const therapistIds = availableTherapists.map((t) => t.id)

    const { data: availableSlots } = await adminClient
      .from('therapist_slots')
      .select('therapist_id')
      .in('therapist_id', therapistIds)
      .eq('day', currentDay)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)

    let candidateIds: string[]
    if (availableSlots && availableSlots.length > 0) {
      candidateIds = availableSlots.map((s) => s.therapist_id)
    } else {
      // If no slot-based filtering is available, use all non-busy therapists
      candidateIds = therapistIds
    }

    // Pick therapist with fewest sessions today (load balancing)
    const candidates = availableTherapists.filter((t) => candidateIds.includes(t.id))
    if (candidates.length === 0) {
      // Fall back to any available therapist
      candidates.push(...availableTherapists)
    }

    // Sort by sessions_today ascending for load balancing
    candidates.sort((a, b) => (a.sessions_today ?? 0) - (b.sessions_today ?? 0))
    const selectedTherapist = candidates[0]

    // Create therapy session
    const { data: session, error: sessionError } = await adminClient
      .from('therapy_sessions')
      .insert({
        student_id: anonymous ? null : studentId,
        therapist_id: selectedTherapist.id,
        status: 'queued',
        urgency,
        anonymous: anonymous ?? false,
        triage_summary: triageSummary ?? null,
      })
      .select('id')
      .single()

    if (sessionError || !session) {
      throw new Error(`Failed to create session: ${sessionError?.message}`)
    }

    // Update therapist profile: mark as busy
    await adminClient
      .from('therapist_profiles')
      .update({
        currently_busy: true,
        active_session_with: studentId,
      })
      .eq('id', selectedTherapist.id)

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        therapist: {
          id: selectedTherapist.id,
          name: selectedTherapist.full_name ?? selectedTherapist.name,
          specialization: selectedTherapist.specialization ?? null,
        },
        status: 'connected',
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
