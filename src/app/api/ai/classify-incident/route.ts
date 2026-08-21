import { NextResponse } from 'next/server';
import { analyzeIncident, AIIncidentOutputSchema } from '@/lib/services/ai-incident';
import { z } from 'zod';

const RequestSchema = z.object({
  title: z.string().optional(),
  description: z.string().min(3, 'Description must be at least 3 characters long'),
  location: z.string().optional(),
  category: z.string().optional(),
  is_emergency: z.boolean().optional(),
  evidence_urls: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
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

    if (error instanceof z.ZodError || (error && typeof error === 'object' && ('issues' in error || (error as { name?: string }).name === 'ZodError'))) {
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
