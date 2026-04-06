import { SignJWT } from 'jose';
import { proxyAuthRequest, JWT_SECRET } from '@/lib/auth-proxy';
import { sendEmail, verificationEmail } from '@/lib/mailersend';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://quantumcodevault.com').trim();

export async function POST(request: Request) {
  // Clone the request so we can read the body twice
  const body = await request.text();
  const clonedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body,
  });

  const response = await proxyAuthRequest(clonedRequest, '/api/auth/register');

  // If registration succeeded, send verification email (fire and forget)
  if (response.ok) {
    try {
      const parsed = JSON.parse(body);
      const email = (parsed.email || '').trim().toLowerCase();
      const username = parsed.username || email;

      if (email) {
        const verifyToken = await new SignJWT({
          purpose: 'email-verification',
          email,
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('24h')
          .sign(JWT_SECRET);

        const verifyUrl = `${SITE_URL}/verify-email/${verifyToken}`;
        const { subject, html, text } = verificationEmail(username, verifyUrl);
        sendEmail({ to: { email, name: username }, subject, html, text }).catch(console.error);
      }
    } catch {
      // Don't fail registration if email sending fails
    }
  }

  return response;
}
