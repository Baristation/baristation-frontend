# 인증 및 토큰 관리 명세 (Current)

## 1. 개요

본 문서는 Dripnote 프론트엔드의 소셜 로그인, 토큰 재발급, 로그아웃(BFF 패턴) 프로세스를 정의합니다. 현재 구조는 미들웨어 중심의 프록시 및 환승역(Transit) 방식을 채택하고 있으며, 인증 관련 API 로직은 모두 **Server Action**으로 처리하여 민감 정보가 브라우저에 노출되지 않도록 합니다.

---

## 2. 통합 아키텍처 및 통신 구조

모든 백엔드 통신 및 인증 로직은 다음 4개의 핵심 파일로 응집되었습니다.

### 2.1 통합 백엔드 클라이언트 (`lib/api/backend.ts`)

- **역할**: 모든 백엔드 요청의 유일한 진입점.
- **주요 함수**:
  - `fetchBackend(endpoint, options)`: BFF 필수 헤더 및 서버사이드 쿠키를 자동으로 주입하는 fetch 래퍼.
  - `refreshTokens(bffRequest?)`: 백엔드 `/api/auth/refresh`와 통신하여 토큰을 갱신하는 공통 로직.
  - `getBackendBaseUrl()`: OAuth 리다이렉트 등 절대 URL 구성이 필요할 때 사용.
- **보안**: BFF 설정(`getBffInfo`, `buildBffHeaders`) 로직을 내부로 숨겨 캡슐화.

### 2.2 인증 유틸리티 (`lib/utils/auth.ts`)

- **역할**: 상수, 클라이언트 인증 상태 확인, 쿠키 프록시 및 로컬 재작성 처리.
- **주요 기능**:
  - `AUTH_TOKEN_KEY`, `REDIRECT_COOKIE_KEY` 등 상수 정의.
  - `authUtils`: 클라이언트 사이드에서 토큰 읽기/삭제 및 인증 여부 확인.
  - `proxyCookies`, `rewriteCookieForLocal`: 백엔드 쿠키를 프론트엔드로 전달할 때 로컬 환경(HTTP)에 맞게 재작성.

### 2.3 미들웨어 (`middleware.ts`)

- **역할**: 전역 경로 보호, OAuth 콜백 프록시, 로그인 페이지 가드.
- **보안 강화**: 인증된 사용자가 `/login` 접근 시 홈(`/`)으로 리다이렉트하는 `handleLoginPage` 추가.

### 2.4 서버 액션 (`actions/auth.action.ts`)

- **역할**: 클라이언트에서 호출 가능한 보안 인증 인터페이스.
- **주요 액션**: `logoutAction`, `getUserAction`, `refreshAction`.

---

## 3. 상세 프로세스

### 3.1 소셜 로그인 및 콜백

1. **시작**: `/api/auth/[provider]/route.ts`가 `getBackendBaseUrl()`을 사용하여 백엔드 인가 주소로 리다이렉트.
2. **콜백 프록시**: 백엔드의 `/login/oauth2/code/*` 응답을 미들웨어가 `fetchBackend`로 가로채어 쿠키를 캡처 후 `/auth/success`로 이동.
3. **환승역(Transit)**: 미들웨어가 `/auth/success`에서 `refreshTokens(request)`를 호출하여 최종 `accessToken`을 발급받고 목적지로 리다이렉트.

### 3.2 로그아웃 (Server Action)

1. 클라이언트가 `logoutAction()` 호출.
2. 서버에서 쿠키의 `accessToken`으로 백엔드 `/api/auth/logout` 호출 (세션 무효화).
3. 서버사이드에서 `accessToken` 및 `refreshToken` 쿠키 즉시 삭제.

### 3.3 토큰 재발급 (Refresh)

1. **자동**: 미들웨어에서 Protected 경로 접근 시 토큰이 만료되었으면 `refreshTokens(request)` 호출.
2. **수동/폴백**: 클라이언트에서 401 발생 시 `refreshAction()` 서버 액션 호출.

### 3.4 유저 정보 조회 (Server Action)

1. 클라이언트가 `getUserAction()` 호출.
2. 서버에서 쿠키의 `accessToken`으로 현재 로그인한 유저 정보를 반환 (현재 Mock 데이터 제공 중).
3. 향후 백엔드 `/api/member/me` 연동 시 주석 처리된 백엔드 연동 코드를 해제하여 실제 데이터 사용.

### 3.5 Playground 테스트 요청 (Server Action)

1. 클라이언트에서 백엔드로 직접 통신하는 대신 `executePlaygroundRequest(url, method)` 서버 액션 호출.
2. `fetchBackend`를 거쳐 서버사이드에서 안전하게 API 요청 실행.
3. 브라우저에 BFF Secret 등 통신 설정과 헤더를 노출하지 않고 백엔드 API를 테스트하기 위한 용도.

---

## 4. 기술 스펙 및 필수 헤더

### 필수 헤더 (BFF → Backend)

| 헤더                                  | 설명                                                  |
| :------------------------------------ | :---------------------------------------------------- |
| `X-BFF-Secret`                        | BFF 보안 인증키 (환경변수)                            |
| `X-BFF-Host` / `Proto` / `Port`       | 클라이언트의 원래 접속 정보 (백엔드 세션/쿠키 생성용) |
| `X-Forwarded-Host` / `Proto` / `Port` | 표준 프록시 헤더 호환성 유지                          |
| `Cookie`                              | 서버사이드 호출 시 브라우저 쿠키를 백엔드로 전달      |

### 쿠키 정책

- `baristation-auth-token` (`AUTH_TOKEN_KEY`): 클라이언트 접근 가능 (JS용), 짧은 수명.
- `refreshToken`: `HttpOnly`, `Secure`, `SameSite=Lax` (백엔드 관리).
- **로컬 개발**: `rewriteCookieForLocal` 유틸리티를 통해 HTTP 환경에서 `Secure` 속성 제거 및 `SameSite=Lax` 강제 적용.

---

## 5. 레이어별 사용 기준

| 케이스                  | 방식               | 위치                               |
| :---------------------- | :----------------- | :--------------------------------- |
| 인증/로그아웃/유저 조회 | **Server Action**  | `actions/auth.action.ts`           |
| Playground 테스트 요청  | **Server Action**  | `actions/playground.action.ts`     |
| OAuth 콜백 프록시       | **API Route**      | `app/api/auth/[provider]/route.ts` |
| 전역 경로 보호/가드     | **Middleware**     | `middleware.ts`                    |
| 백엔드 통신 유틸        | **Backend Client** | `lib/api/backend.ts`               |
