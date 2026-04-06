import { SignJWT, decodeJwt } from 'jose';

export const BACKEND_URL = (process.env.BACKEND_URL || 'http://188.165.254.184:8106').trim();
export const JWT_SECRET = new TextEncoder().encode(
  (process.env.JWT_SECRET_KEY || 'qcv-jwt-secret-change-me-in-production').trim()
);

/**
 * Re-sign a JWT token ensuring the `sub` claim is a string.
 * The VPS backend creates tokens with integer `sub` which flask-jwt-extended 4.7+ rejects.
 */
export async function fixToken(token: string): Promise<string> {
  try {
    const payload = decodeJwt(token);
    if (typeof payload.sub !== 'string') {
      // Rebuild the token with string sub and same claims
      const builder = new SignJWT({ ...payload, sub: String(payload.sub) })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' });
      // Don't re-set iat/exp/nbf — they're already in the payload spread
      return await builder.sign(JWT_SECRET);
    }
    return token;
  } catch {
    return token;
  }
}

/**
 * Proxy a request to the backend and fix any JWT tokens in the response.
 */
export async function proxyAuthRequest(request: Request, path: string): Promise<Response> {
  const body = request.method !== 'GET' ? await request.text() : undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Forward Authorization header if present (for refresh)
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  const backendRes = await fetch(`${BACKEND_URL}${path}`, {
    method: request.method,
    headers,
    body,
  });

  const data = await backendRes.json();

  // Fix tokens in the response
  if (backendRes.ok && data.access_token) {
    data.access_token = await fixToken(data.access_token);
  }
  if (backendRes.ok && data.refresh_token) {
    data.refresh_token = await fixToken(data.refresh_token);
  }

  return Response.json(data, { status: backendRes.status });
}
