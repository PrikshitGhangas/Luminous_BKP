import { NextResponse } from 'next/server';
import { DEMO_USERS } from '@/lib/constants/demo-data';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    demo_users: Object.values(DEMO_USERS).map((u) => ({
      email: u.email,
      role: u.role,
      name: u.full_name,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    const matched = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email?.toLowerCase()
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
