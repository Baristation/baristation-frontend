import { NextRequest, NextResponse } from 'next/server';

import { fetchBackend, getBackendBaseUrl } from '@/lib/api/backend';
import { proxyCookies } from '@/lib/utils/auth';

/**
 * BFF (Backend For Frontend) OAuth Authorization Redirect Handler
 */
const ALLOWED_PROVIDERS = ['google', 'naver', 'kakao'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!ALLOWED_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Invalid auth provider' }, { status: 400 });
  }

  const backendUrl = `${getBackendBaseUrl()}/oauth2/authorization/${provider}`;
  const isLocal =
    request.nextUrl.hostname === 'localhost' ||
    request.nextUrl.hostname === '127.0.0.1' ||
    request.nextUrl.protocol === 'http:';

  try {
    const response = await fetchBackend(backendUrl, {
      method: 'GET',
      bffRequest: request,
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    });

    const redirectUrl = response.headers.get('location');

    if (redirectUrl) {
      const res = NextResponse.redirect(redirectUrl);
      proxyCookies(response, res, isLocal);
      return res;
    }

    return NextResponse.json(
      { error: 'Failed to retrieve redirect location from backend' },
      { status: 500 },
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({ error: 'Backend request timed out' }, { status: 504 });
    }
    console.error(`BFF Auth Error (${provider}):`, error);
    return NextResponse.json({ error: 'Internal Server Error in BFF' }, { status: 500 });
  }
}
