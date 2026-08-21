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

    const { incidentId } = await req.json() as { incidentId: string }

    if (!incidentId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: incidentId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the incident and verify it's eligible for escalation
    const { data: incident, error: fetchError } = await adminClient
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single()

    if (fetchError || !incident) {
      return new Response(
        JSON.stringify({ error: 'Incident not found', details: fetchError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (incident.status !== 'reported') {
      return new Response(
        JSON.stringify({ error: `Cannot escalate incident with status '${incident.status}'. Expected 'reported'.` }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (incident.sos_level !== 'campus') {
      return new Response(
        JSON.stringify({ error: `Incident is already at '${incident.sos_level}' level. Only 'campus' level incidents can be escalated.` }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Escalate the incident
    const { error: updateError } = await adminClient
      .from('incidents')
      .update({
        sos_level: 'police',
        auto_escalated: true,
        escalated_at: new Date().toISOString(),
      })
      .eq('id', incidentId)

    if (updateError) {
      throw new Error(`Failed to escalate incident: ${updateError.message}`)
    }

    // Find ALL available guards and volunteers
    const { data: allGuards } = await adminClient
      .from('users')
      .select('id, name, phone')
      .in('role', ['guard', 'volunteer'])
      .eq('is_available', true)

    const guards = (allGuards ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      phone: g.phone,
    }))

    return new Response(
      JSON.stringify({
        escalated: true,
        incidentId,
        allGuardsNotified: guards.length,
        guards,
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
