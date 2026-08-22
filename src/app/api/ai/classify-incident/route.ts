import { NextResponse } from 'next/server';
import { analyzeIncident, AIIncidentOutputSchema } from '@/lib/services/ai-incident';
import { z } from 'zod';
import { verifyOrigin } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

const RequestSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().min(3, 'Description must be at least 3 characters long').max(4000),
  location: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  is_emergency: z.boolean().optional(),
  evidence_urls: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  // 1. CSRF Verification
  const csrf = verifyOrigin(request);
  if (!csrf.valid) {
    return NextResponse.json({ success: false, error: csrf.error }, { status: 403 });
  }

  // 2. Rate Limiting (35 req / min)
  const ip = getClientIdentifier(request);
  const rateCheck = checkRateLimit(ip, 'ai_triage');
  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, error: 'AI classification rate limit exceeded. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
    );
  }

  try {
    const json = await request.json();
    const parseResult = RequestSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }
    const validatedInput = parseResult.data;

    // Call server-side analyzeIncident()
    const classification = await analyzeIncident(validatedInput);

    // Re-verify output schema for defensive guarantee
    const validatedOutput = AIIncidentOutputSchema.parse(classification);

    return NextResponse.json({
      success: true,
      data: validatedOutput,
      model: 'Gemini 3.7 Flash & Safety AI Mesh',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/classify-incident:', error);

    if (
      error instanceof z.ZodError ||
      (error && typeof error === 'object' && ('issues' in error || (error as { name?: string }).name === 'ZodError'))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: (error as { issues?: unknown }).issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze incident report',
      },
      { status: 500 }
    );
  }
}
