# 인증 및 토큰 관리 명세 (Current)

## 1. 개요

본 문서는 Dripnote 프론트엔드의 소셜 로그인 및 토큰 재발급(BFF 패턴) 프로세스를 정의합니다. 현재 구조는 미들웨어 중심의 프록시 및 환승역(Transit) 방식을 채택하고 있습니다.

## 2. 소셜 로그인 흐름

### 2.1 로그인 시작

1. 사용자가 UI에서 로그인 버튼 클릭 (예: `/api/auth/google`)
2. `app/api/auth/[provider]/route.ts` 실행:
   - 백엔드 `${BACKEND_URL}/oauth2/authorization/[provider]` 호출.
   - 응답의 `location` 헤더(소셜 인가 페이지 URL)를 추출하여 브라우저 리다이렉트.
   - 백엔드가 설정한 쿠키를 브라우저에 전달 (`proxyCookies`).

### 2.2 콜백 및 토큰 발급

1. 소셜 서비스 인증 후 백엔드로 인가 코드(Code) 전달.
2. 백엔드가 프론트엔드로 리다이렉트 시 미들웨어가 이를 가로챔.
3. `middleware.ts`의 OAuth 프록시 로직:
   - `/login/oauth2/code/*` 경로를 백엔드로 프록시.
   - 백엔드 응답 쿠키(refreshToken 등)를 브라우저에 설정.
   - `/auth/success`로 리다이렉트.

### 2.3 최종 완료 (Transit)

1. `/auth/success` 접근 시 미들웨어가 다시 가로챔:
   - `refreshToken` 유무 확인.
   - `authService.refreshAccessToken`을 호출하여 `accessToken` 발급.
   - `accessToken` 쿠키 설정 후 최종 목적지(또는 홈)로 리다이렉트.

## 3. Access Token 재발급 (Refresh)

### 3.1 자동 재발급 (Middleware)

- Protected 경로 접근 시 `accessToken`이 없고 `refreshToken`만 있는 경우 미들웨어 내에서 동기적으로 재발급 수행.

### 3.2 수동 재발급 (API Route)

- 클라이언트 애플리케이션(React Query 등)에서 401 에러 감지 시 `POST /api/auth/refresh` 호출.
- `app/api/auth/refresh/route.ts`가 백엔드와 통신하여 새 토큰을 받아와 쿠키를 업데이트.

## 4. 기술 스펙 및 필수 헤더

### 사용 기술

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Edge Runtime (Middleware), Node.js Runtime (API Routes)
- **Communication**: Fetch API + BFF Headers

### 필수 헤더 (BFF -> Backend)

인증 관련 모든 요청은 `getBffHeaders` 유틸리티를 통해 다음 헤더를 포함해야 함:

- `X-BFF-Secret`: BFF 보안 인증키
- `X-BFF-Host`: 클라이언트 Host
- `X-BFF-Proto`: 프로토콜 (http/https)
- `X-BFF-Port`: 포트 번호
- `Cookie`: 브라우저로부터 전달받은 모든 쿠키

### 쿠키 정책

- `accessToken`: 클라이언트 접근 가능 (JavaScript), 짧은 수명.
- `refreshToken`: `HttpOnly`, `Secure`, `SameSite=Lax`, 긴 수명 (백엔드 관리).
- `redirect_to`: 로그인 완료 후 복귀할 경로 저장용.
