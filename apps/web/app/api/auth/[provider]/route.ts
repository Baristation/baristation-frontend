import { NextRequest, NextResponse } from 'next/server';

import { getBffInfo, getBffHeaders, proxyCookies } from '@/lib/utils/bff-utils';

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

  const bffInfo = getBffInfo(request);
  const backendUrl = `${bffInfo.backendUrl}/oauth2/authorization/${provider}`;

  try {
    const requestHeaders = getBffHeaders(bffInfo, {
      cookie: request.headers.get('cookie') ?? '',
      'user-agent': request.headers.get('user-agent') ?? '',
    });

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual',
      signal: AbortSignal.timeout(5000),
    });

    const redirectUrl = response.headers.get('location');

    if (redirectUrl) {
      const res = NextResponse.redirect(redirectUrl);

      // 백엔드 쿠키들을 브라우저로 전달
      proxyCookies(response, res, bffInfo.isLocal);

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
