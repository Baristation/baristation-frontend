# 인증 및 토큰 관리 명세 (Current)

## 1. 개요

본 문서는 Dripnote 프론트엔드의 소셜 로그인, 토큰 재발급, 로그아웃(BFF 패턴) 프로세스를 정의합니다. 현재 구조는 미들웨어 중심의 프록시 및 환승역(Transit) 방식을 채택하고 있으며, 인증 관련 API 로직은 모두 **Server Action**으로 처리하여 민감 정보가 브라우저에 노출되지 않도록 합니다.

## 2. 소셜 로그인 흐름

### 2.1 로그인 시작

1. 사용자가 UI에서 로그인 버튼 클릭 (예: `/api/auth/google`)
2. `app/api/auth/[provider]/route.ts` 실행:
   - 백엔드 `${BACKEND_URL}/oauth2/authorization/[provider]` 호출 (`fetchBackend` 사용, BFF 헤더 자동 포함).
   - 응답의 `location` 헤더(소셜 인가 페이지 URL)를 추출하여 브라우저 리다이렉트.
   - 백엔드가 설정한 쿠키를 브라우저에 전달 (`proxyCookies`).

### 2.2 콜백 및 토큰 발급

1. 소셜 서비스 인증 후 백엔드로 인가 코드(Code) 전달.
2. 백엔드가 프론트엔드로 리다이렉트 시 미들웨어가 이를 가로챔.
3. `middleware.ts`의 OAuth 프록시 로직:
   - `/login/oauth2/code/*` 경로를 백엔드로 프록시 (`fetchBackend` 사용).
   - 백엔드 응답 쿠키(refreshToken 등)를 브라우저에 설정.
   - `/auth/success`로 리다이렉트.

### 2.3 최종 완료 (Transit)

1. `/auth/success` 접근 시 미들웨어가 다시 가로챔:
   - `refreshToken` 유무 확인.
   - `authService.refreshAccessToken(request)`을 호출하여 `accessToken` 발급.
   - `accessToken` 쿠키 설정 후 최종 목적지(또는 홈)로 리다이렉트.

## 3. 로그아웃

### 3.1 Server Action 방식

- 클라이언트에서 `logoutAction()` Server Action 호출 (`actions/auth-actions.ts`).
- 서버에서 쿠키의 `accessToken`을 읽어 백엔드 `/api/auth/logout`에 `Authorization: Bearer {accessToken}` 헤더로 요청.
- 백엔드에서 세션 무효화 후, 서버에서 `accessToken` 및 `refreshToken` 쿠키를 직접 삭제.
- 클라이언트는 로그인 페이지로 이동.

### 3.2 백엔드 로그아웃 API 스펙

| 항목           | 값                                                            |
| -------------- | ------------------------------------------------------------- |
| Method         | `POST`                                                        |
| Endpoint       | `/api/auth/logout`                                            |
| Request Header | `Authorization: Bearer {accessToken}`                         |
| Response       | `{ statusCode: "200", message: "로그아웃 성공", data: null }` |

## 4. Access Token 재발급 (Refresh)

### 4.1 자동 재발급 (Middleware)

- Protected 경로 접근 시 `accessToken`이 없고 `refreshToken`만 있는 경우 미들웨어 내에서 동기적으로 재발급 수행.
- `authService.refreshAccessToken(request)`을 호출하여 처리.

### 4.2 수동/안전장치 재발급 (Server Action)

- 클라이언트 애플리케이션(React Query 등)에서 401 에러 감지 시 또는 미들웨어 스킵 시 `refreshAction()` Server Action 호출.
- `actions/auth.action.ts`가 백엔드와 통신하여 새 토큰을 받아와 쿠키를 업데이트.

## 5. 유저 정보 조회

- 클라이언트에서 `getUserAction()` Server Action 호출 (`actions/auth-actions.ts`).
- 서버에서 쿠키의 `accessToken`을 읽어 유저 정보를 반환.
- 백엔드 `/api/member/me` 연동 시 Server Action 내 주석 해제.

## 6. 기술 스펙 및 필수 헤더

### 사용 기술

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Edge Runtime (Middleware), Node.js Runtime (API Routes, Server Actions)
- **Communication**: `fetchBackend` 통합 클라이언트 (`lib/api/client.ts`)

### 통합 API 클라이언트 (`fetchBackend`)

모든 백엔드 요청은 `fetchBackend(endpoint, options)`를 통해 수행하며, 다음을 자동으로 처리합니다:

- BFF 필수 헤더 (`X-BFF-Secret`, `X-BFF-Host`, `X-BFF-Proto`, `X-BFF-Port`) 자동 주입
- `X-Forwarded-*` 호환 헤더 자동 추가
- Server Component/Action 컨텍스트에서 `Cookie` 헤더 자동 전달
- Middleware 컨텍스트에서는 `bffRequest` 옵션으로 요청 객체 명시적 전달

### 필수 헤더 (BFF → Backend)

| 헤더            | 값                     | 설명                         |
| --------------- | ---------------------- | ---------------------------- |
| `X-BFF-Secret`  | `BFF_SECRET` 환경변수  | BFF 보안 인증키              |
| `X-BFF-Host`    | BFF 서버 호스트        | 클라이언트 Host              |
| `X-BFF-Proto`   | `http` / `https`       | 프로토콜                     |
| `X-BFF-Port`    | BFF 서버 포트          | 포트 번호                    |
| `Cookie`        | 요청 쿠키 전달         | 서버사이드 호출 시 자동 포함 |
| `Authorization` | `Bearer {accessToken}` | 인증이 필요한 API 요청 시    |

### 쿠키 정책

- `baristation-auth-token` (`AUTH_TOKEN_KEY`): 클라이언트 접근 가능 (JavaScript), 짧은 수명.
- `refreshToken`: `HttpOnly`, `Secure`, `SameSite=Lax`, 긴 수명 (백엔드 관리).
- `baristation-redirect-to` (`REDIRECT_COOKIE_KEY`): 로그인 완료 후 복귀할 경로 저장용.

### Server Action vs API Route 사용 기준

| 케이스                       | 방식                                               |
| ---------------------------- | -------------------------------------------------- |
| 인증/로그아웃/유저 정보 조회 | **Server Action** (`actions/auth.action.ts`)       |
| OAuth 콜백 프록시            | **API Route** (리다이렉트 응답 처리 필요)          |
| 토큰 재발급 (수동)           | **Server Action** (`actions/auth.action.ts`)       |
| Playground 테스트 요청       | **Server Action** (`actions/playground.action.ts`) |
| Middleware 내 인증 처리      | **Middleware** (Edge Runtime)                      |
