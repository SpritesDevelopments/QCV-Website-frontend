import { SignJWT } from 'jose';
import { JWT_SECRET, BACKEND_URL, fixToken } from '@/lib/auth-proxy';
import { sendEmail, passwordResetEmail } from '@/lib/mailersend';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumcodevault.com').trim();

export async function POST(request: Request) {
  const data = await request.json().catch(() => ({}));
  const email = (data.email || '').trim().toLowerCase();

  if (!email) {
    return Response.json({ message: 'If that email is registered, a reset link has been sent.' });
  }

  // Check if user exists via VPS admin API (need admin token)
  try {
    const adminEmail = (process.env.VPS_ADMIN_EMAIL || 'admin@qcv.com').trim();
    const adminPassword = (process.env.VPS_ADMIN_PASSWORD || 'admin123').trim();

    // Login as admin
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });

    if (!loginRes.ok) {
      console.error('[request-reset] Admin login failed');
      return Response.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const loginData = await loginRes.json();
    const adminToken = await fixToken(loginData.access_token);

    // Find user by email
    const usersRes = await fetch(`${BACKEND_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (!usersRes.ok) {
      console.error('[request-reset] Failed to fetch users');
      return Response.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const users = await usersRes.json();
    const user = users.find((u: { email: string }) => u.email === email);

    if (!user) {
      // User doesn't exist — return same message to avoid enumeration
      return Response.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate reset token (JWT with user info, 1 hour expiry)
    const resetToken = await new SignJWT({
      purpose: 'password-reset',
      email,
      user_id: user.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(JWT_SECRET);

    const resetUrl = `${SITE_URL}/reset-password/${resetToken}`;
    const { subject, html, text } = passwordResetEmail(user.username || email, resetUrl);

    await sendEmail({ to: { email, name: user.username }, subject, html, text });
  } catch (err) {
    console.error('[request-reset] Error:', err);
  }

  // Always return same response to prevent user enumeration
  return Response.json({ message: 'If that email is registered, a reset link has been sent.' });
}
