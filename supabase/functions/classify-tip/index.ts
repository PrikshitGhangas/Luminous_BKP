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
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

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

    const { text, anonymous } = await req.json() as {
      text: string
      anonymous: boolean
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or empty required field: text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call Gemini API for classification
    const prompt = `You are a campus safety tip classifier. Classify the following campus tip into:
- category: one of "harassment", "ragging", "infrastructure", "medical", "academic", "other"
- severity: one of "low", "medium", "high"

Tip text: "${text}"

Return a JSON object with exactly two fields: "category" and "severity".`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errBody = await geminiResponse.text()
      throw new Error(`Gemini API error (${geminiResponse.status}): ${errBody}`)
    }

    const geminiData = await geminiResponse.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) {
      throw new Error('Empty response from Gemini API')
    }

    let classification: { category: string; severity: string }
    try {
      classification = JSON.parse(rawText)
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${rawText}`)
    }

    const aiCategory = classification.category ?? 'other'
    const aiSeverity = classification.severity ?? 'medium'

    // Insert tip into database
    const { data: tip, error: insertError } = await adminClient
      .from('tips')
      .insert({
        reported_by: anonymous ? null : user.id,
        text,
        anonymous: anonymous ?? false,
        ai_category: aiCategory,
        ai_severity: aiSeverity,
        status: 'new',
      })
      .select('id')
      .single()

    if (insertError || !tip) {
      throw new Error(`Failed to insert tip: ${insertError?.message}`)
    }

    return new Response(
      JSON.stringify({
        tipId: tip.id,
        aiCategory,
        aiSeverity,
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
