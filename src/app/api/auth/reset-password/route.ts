import { jwtVerify } from 'jose';
import { JWT_SECRET, BACKEND_URL, fixToken } from '@/lib/auth-proxy';

export async function POST(request: Request) {
  const data = await request.json().catch(() => ({}));
  const { token, password, confirm_password } = data;

  if (!token || !password) {
    return Response.json({ error: 'Token and password are required.' }, { status: 400 });
  }

  if (password !== confirm_password) {
    return Response.json({ error: 'Passwords do not match.' }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  // Verify the reset JWT
  let payload;
  try {
    const result = await jwtVerify(token, JWT_SECRET);
    payload = result.payload;
  } catch {
    return Response.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
  }

  if (payload.purpose !== 'password-reset' || !payload.user_id) {
    return Response.json({ error: 'Invalid reset token.' }, { status: 400 });
  }

  // Login as admin to VPS
  const adminEmail = (process.env.VPS_ADMIN_EMAIL || 'admin@qcv.com').trim();
  const adminPassword = (process.env.VPS_ADMIN_PASSWORD || 'admin123').trim();

  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });

    if (!loginRes.ok) {
      return Response.json({ error: 'Service unavailable. Please try again later.' }, { status: 503 });
    }

    const loginData = await loginRes.json();
    const adminToken = await fixToken(loginData.access_token);

    // Reset the user's password via admin API
    const resetRes = await fetch(`${BACKEND_URL}/api/admin/users/${payload.user_id}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ new_password: password }),
    });

    if (resetRes.ok) {
      return Response.json({ message: 'Password has been reset. You can now log in.' });
    }

    const err = await resetRes.json().catch(() => ({}));
    return Response.json(
      { error: (err as Record<string, string>).error || 'Failed to reset password.' },
      { status: resetRes.status }
    );
  } catch (err) {
    console.error('[reset-password] Error:', err);
    return Response.json({ error: 'Service unavailable. Please try again later.' }, { status: 503 });
  }
}
