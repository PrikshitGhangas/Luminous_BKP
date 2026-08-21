import { NextResponse } from 'next/server';
import { z } from 'zod';

const SosSchema = z.object({
  user_id: z.string().default('usr-student-05'),
  user_name: z.string().optional(),
  location: z.string().min(2).default('Academic Block A'),
  category: z.enum(['womens_safety', 'sos_panic', 'medical', 'threat']).default('sos_panic'),
  coordinates: z
    .object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    })
    .optional(),
  description: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const validated = SosSchema.parse(rawBody);

    const sosEvent = {
      id: `sos-${Date.now()}`,
      status: 'active',
      location: validated.location,
      user_id: validated.user_id,
      user_name: validated.user_name || 'Student Reporter',
      category: validated.category,
      coordinates: validated.coordinates || { lat: 12.9724, lng: 77.5952 },
      description: validated.description || 'Emergency SOS button triggered via mobile safety portal',
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, sos: sosEvent }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: 'Failed to broadcast SOS' }, { status: 500 });
  }
}
