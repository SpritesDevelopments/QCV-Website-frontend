import { proxyAuthRequest } from '@/lib/auth-proxy';

export async function POST(request: Request) {
  return proxyAuthRequest(request, '/api/auth/login');
}
