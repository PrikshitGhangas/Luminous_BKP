import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyOrigin } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';
import { authenticateApiRequest } from '@/lib/security/auth-guard';
import { generateSecureId } from '@/lib/security/crypto';

const SosSchema = z.object({
  user_id: z.string().optional(),
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
  // 1. CSRF Verification
  const csrf = verifyOrigin(request);
  if (!csrf.valid) {
    return NextResponse.json({ success: false, error: csrf.error }, { status: 403 });
  }

  // 2. Rate Limiting (10 req/min with burst tolerance)
  const ip = getClientIdentifier(request);
  const rateCheck = checkRateLimit(ip, 'sos');
  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, error: 'SOS trigger rate limit exceeded. Please wait a moment before sending another alert.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
    );
  }

  // 3. User Authentication
  const auth = await authenticateApiRequest(request);

  try {
    const rawBody = await request.json();
    const parseResult = SosSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parseResult.error.issues },
        { status: 400 }
      );
    }
    const validated = parseResult.data;

    const effectiveUserId = validated.user_id || auth.user?.id || 'usr-student-05';
    const effectiveUserName = validated.user_name || auth.user?.full_name || 'Student Reporter';

    const sosEvent = {
      id: generateSecureId('sos'),
      status: 'active',
      location: validated.location,
      user_id: effectiveUserId,
      user_name: effectiveUserName,
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
