import { NextRequest, NextResponse } from 'next/server';

/**
 * BFF (Backend For Frontend) OAuth Authorization Redirect Handler
 *
 * [동작 원리]
 * 1. 클라이언트로부터 /api/auth/[provider] 요청을 받음
 * 2. 실제 백엔드 주소로 'manual' 리다이렉트 요청을 보냄
 * 3. 백엔드의 302 응답에서 Location 헤더(구글/네이버 로그인 창 주소)를 추출
 * 4. 브라우저에게 해당 주소로 리다이렉트 하라고 응답 (백엔드 주소 은닉)
 */
const ALLOWED_PROVIDERS = ['google', 'naver', 'kakao'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  // 0. Provider 유효성 검증 (Allowlist)
  if (!ALLOWED_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: 'Invalid auth provider' }, { status: 400 });
  }

  const backendBaseUrl = process.env.BACKEND_URL;

  if (!backendBaseUrl) {
    console.error('Missing BACKEND_URL environment variable');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const backendUrl = `${backendBaseUrl}/oauth2/authorization/${provider}`;
  const isSecure = request.nextUrl.protocol === 'https:';

  try {
    // 1. 브라우저의 요청 헤더(쿠키 등)를 백엔드로 전달
    const requestHeaders = new Headers();
    const cookie = request.headers.get('cookie');
    if (cookie) requestHeaders.set('cookie', cookie);

    // User-Agent 등 보안상 필요한 헤더 전달
    const userAgent = request.headers.get('user-agent');
    if (userAgent) requestHeaders.set('user-agent', userAgent);

    /**
     * [X-Forwarded 헤더 주입 — Spring Security redirect_uri 오버라이드]
     *
     * 배경:
     * - Spring Security는 redirect-uri에 {baseUrl} 플레이스홀더를 사용
     * - BFF가 서버-서버로 호출하면 백엔드가 {baseUrl} = dev.dripnote.store 로 판단
     * - X-Forwarded-Host/Proto 헤더를 주입하면 Spring Security의 ForwardedHeaderFilter가
     *   {baseUrl}을 프론트엔드 Origin으로 오버라이드함
     *
     * 동작 조건:
     * - 백엔드 Spring Security에 ForwardedHeaderFilter 또는 server.forward-headers-strategy 설정 필요
     * - application.yml: server.forward-headers-strategy: framework
     *
     * 결과:
     * - redirect_uri = http://localhost:3000/login/oauth2/code/{provider}  (로컬)
     * - redirect_uri = https://프론트도메인/login/oauth2/code/{provider}  (프로덕션)
     */
    const frontendOrigin = request.nextUrl.origin; // e.g. "http://localhost:3000"
    const frontendUrl = new URL(frontendOrigin);

    requestHeaders.set('X-Forwarded-Host', frontendUrl.host); // "localhost:3000"
    requestHeaders.set('X-Forwarded-Proto', frontendUrl.protocol.replace(':', '')); // "http"
    requestHeaders.set('X-Forwarded-Port', frontendUrl.port || (isSecure ? '443' : '80'));
    requestHeaders.set('X-Forwarded-Prefix', '');

    // [X-BFF 헤더 추가 — 백엔드 커스텀 요구사항]
    const bffSecret = process.env.BFF_SECRET;
    if (bffSecret) {
      requestHeaders.set('X-BFF-Secret', bffSecret);
    }
    requestHeaders.set('X-BFF-Host', frontendUrl.host);
    requestHeaders.set('X-BFF-Proto', frontendUrl.protocol.replace(':', ''));
    requestHeaders.set('X-BFF-Port', frontendUrl.port || (isSecure ? '443' : '80'));

    // 5초 타임아웃 설정
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual', // 302 응답을 직접 처리하기 위함
      signal: AbortSignal.timeout(5000),
    });

    // 2. 백엔드로부터 받은 리다이렉트 주소 추출
    const redirectUrl = response.headers.get('location');

    if (redirectUrl) {
      const res = NextResponse.redirect(redirectUrl);

      // 3. 백엔드에서 설정한 쿠키들을 브라우저로 전달
      const setCookies = response.headers.getSetCookie();

      if (setCookies.length > 0) {
        setCookies.forEach((cookie) => {
          // 로컬 http 환경이라면 secure 속성을 강제로 제거 (브라우저 거부 방지)
          // 보다 정교한 정규표현식을 사용하여 데이터 손상 방지
          const fixedCookie = isSecure
            ? cookie
            : cookie.replace(/;\s*Secure\b/gi, '').replace(/\bSecure\b\s*;/gi, '');
          res.headers.append('set-cookie', fixedCookie);
        });
      }

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
