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

    const token = authHeader.replace('Bearer ', '').trim()
    const { data: { user }, error: authError } = await adminClient.auth.getUser(token)
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

    // Call Gemini API with model fallback for high availability
    const callGemini = async (promptText: string): Promise<string> => {
      const candidateModels = ['gemini-3.1-flash-lite-preview', 'gemini-flash-latest'];
      let lastErr = '';
      for (const m of candidateModels) {
        try {
          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );
          if (r.ok) {
            const data = await r.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (raw) return raw;
          } else {
            lastErr = `${m} (${r.status}): ${await r.text()}`;
          }
        } catch (e) {
          lastErr = `${m}: ${e instanceof Error ? e.message : 'network error'}`;
        }
      }
      throw new Error(`Gemini models unavailable: ${lastErr}`);
    };

    const rawText = await callGemini(prompt);

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
