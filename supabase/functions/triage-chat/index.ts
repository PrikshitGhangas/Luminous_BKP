import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TRIAGE_SYSTEM_PROMPT = `You are a campus wellbeing triage assistant. Your job is to assess the urgency of a student's messages and determine the appropriate action.

Urgency levels:
- LOW: minor issues, spam, general questions
- MEDIUM: exam stress, homesickness, mild anxiety, academic pressure
- HIGH: harassment reports, panic attacks, bullying, severe anxiety
- CRITICAL: self-harm ideation, assault, suicidal thoughts, immediate physical danger

Respond with a JSON object containing:
- urgency: one of "LOW", "MEDIUM", "HIGH", "CRITICAL"
- isSpam: boolean indicating if this appears to be spam or not a genuine concern
- reasoning: brief explanation of your assessment
- suggestedAction: one of "deflect" (spam/low), "schedule" (medium — schedule a session), "connect_now" (high — connect to counselor immediately), "emergency" (critical — trigger emergency protocols)
- deflectionResponse: a friendly response to send back if action is "deflect", otherwise null`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate the user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

    const { messages } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or empty required field: messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build conversation text for Gemini
    const conversationText = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n')

    const prompt = `${TRIAGE_SYSTEM_PROMPT}

Here is the conversation to assess:

${conversationText}

Respond with the JSON object only.`

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

    let triageResult: {
      urgency: string
      isSpam: boolean
      reasoning: string
      suggestedAction: string
      deflectionResponse: string | null
    }

    try {
      triageResult = JSON.parse(rawText)
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${rawText}`)
    }

    return new Response(
      JSON.stringify(triageResult),
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
