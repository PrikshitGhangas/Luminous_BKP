import { NextResponse } from 'next/server';
import { analyzeComplaint, AIComplaintOutputSchema } from '@/lib/services/ai-complaint';
import { z } from 'zod';

const RequestSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  description: z.string().min(3, 'Description must be at least 3 characters long'),
  location: z.string().optional(),
  categoryHint: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const validatedInput = RequestSchema.parse(json);

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
