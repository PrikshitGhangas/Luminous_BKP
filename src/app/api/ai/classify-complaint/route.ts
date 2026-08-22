import { NextResponse } from 'next/server';
import { analyzeComplaint, AIComplaintOutputSchema } from '@/lib/services/ai-complaint';
import { z } from 'zod';
import { verifyOrigin } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';

const RequestSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long').max(200),
  description: z.string().min(3, 'Description must be at least 3 characters long').max(4000),
  location: z.string().max(100).optional(),
  categoryHint: z.string().max(50).optional(),
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
      { success: false, error: 'Complaint analysis rate limit exceeded. Please wait a moment.' },
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

    const classification = await analyzeComplaint(validatedInput);
    const validatedOutput = AIComplaintOutputSchema.parse(classification);

    return NextResponse.json({
      success: true,
      data: validatedOutput,
      model: 'Gemini 3.7 Flash & Luminous AI Grievance Mesh',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/classify-complaint:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze complaint',
      },
      { status: 500 }
    );
  }
}
