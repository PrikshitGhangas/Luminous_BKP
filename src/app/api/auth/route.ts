import { NextResponse } from 'next/server';
import { DEMO_USERS } from '@/lib/constants/demo-data';
import { verifyOrigin } from '@/lib/security/csrf';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
});

export async function GET(request: Request) {
  const ip = getClientIdentifier(request);
  const rateCheck = checkRateLimit(ip, 'auth');
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
    );
  }

  // In strictly secured production deployments, restrict demo user enumeration
  const isProduction = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE !== 'true';
  if (isProduction) {
    return NextResponse.json(
      {
        status: 'restricted',
        message: 'Demo user enumeration is disabled in production environments for security.',
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    status: 'ok',
    environment: 'demo_development',
    demo_users: Object.values(DEMO_USERS).map((u) => ({
      email: u.email,
      role: u.role,
      name: u.full_name,
    })),
  });

  response.headers.set('X-Demo-Environment', 'true');
  return response;
}

export async function POST(request: Request) {
  // 1. CSRF Verification
  const csrf = verifyOrigin(request);
  if (!csrf.valid) {
    return NextResponse.json({ success: false, error: csrf.error }, { status: 403 });
  }

  // 2. Rate Limiting
  const ip = getClientIdentifier(request);
  const rateCheck = checkRateLimit(ip, 'auth');
  if (!rateCheck.success) {
    return NextResponse.json(
      { success: false, error: 'Authentication rate limit exceeded. Please wait before retrying.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address', details: parseResult.error.issues },
        { status: 400 }
      );
    }
    const { email } = parseResult.data;

    const matched = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (matched) {
      return NextResponse.json({ success: true, user: matched });
    }

    return NextResponse.json(
      { success: true, user: { email, role: 'student', full_name: 'Student User' } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
