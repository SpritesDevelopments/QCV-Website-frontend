import { SignJWT } from 'jose';
import { JWT_SECRET, BACKEND_URL, fixToken } from '@/lib/auth-proxy';
import { sendEmail, verificationEmail } from '@/lib/mailersend';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumcodevault.com').trim();

export async function POST(request: Request) {
  const data = await request.json().catch(() => ({}));
  const email = (data.email || '').trim().toLowerCase();

  if (!email) {
    return Response.json({ error: 'Email is required.' }, { status: 400 });
  }

  // Look up user via admin API
  try {
    const adminEmail = (process.env.VPS_ADMIN_EMAIL || 'admin@qcv.com').trim();
    const adminPassword = (process.env.VPS_ADMIN_PASSWORD || 'admin123').trim();

    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });

    if (!loginRes.ok) {
      return Response.json({ error: 'Service unavailable.' }, { status: 503 });
    }

    const loginData = await loginRes.json();
    const adminToken = await fixToken(loginData.access_token);

    const usersRes = await fetch(`${BACKEND_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!usersRes.ok) {
      return Response.json({ error: 'Service unavailable.' }, { status: 503 });
    }

    const users = await usersRes.json();
    const user = users.find((u: { email: string }) => u.email === email);

    if (!user) {
      // Don't reveal if email exists
      return Response.json({ message: 'If that email is registered, a verification link has been sent.' });
    }

    // Generate verification token
    const verifyToken = await new SignJWT({
      purpose: 'email-verification',
      email,
      user_id: user.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const verifyUrl = `${SITE_URL}/verify-email/${verifyToken}`;
    const { subject, html, text } = verificationEmail(user.username || email, verifyUrl);

    await sendEmail({ to: { email, name: user.username }, subject, html, text });
  } catch (err) {
    console.error('[resend-verification] Error:', err);
  }

  return Response.json({ message: 'If that email is registered, a verification link has been sent.' });
}
