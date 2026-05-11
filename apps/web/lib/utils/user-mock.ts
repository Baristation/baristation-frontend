/**
 * 개발/하네스 단계용 목업 유저 유틸리티
 *
 * 실제 백엔드 유저 정보 API가 연동되기 전까지
 * accessToken을 기반으로 임시 유저 정보를 생성합니다.
 *
 * TODO: 실제 /api/user/me 연동 시 이 파일을 교체하세요.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

/**
 * accessToken에서 간단한 목업 유저 정보를 생성합니다.
 * JWT payload를 직접 파싱하거나, 토큰이 있으면 기본 유저 반환.
 */
export function getMockUserInfo(token: string): User {
  // JWT payload를 간단히 파싱 시도 (서명 검증 없음 — 클라이언트 표시 전용)
  try {
    const [, payloadBase64] = token.split('.');
    if (payloadBase64) {
      // Base64URL → Base64 변환 후 디코딩
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const paddingCount = (4 - (base64.length % 4)) % 4;
      const padded = base64 + '='.repeat(paddingCount);
      const payload = JSON.parse(atob(padded));

      return {
        id: String(payload.sub ?? payload.id ?? 'unknown'),
        name: String(payload.name ?? payload.nickname ?? '바리스테이션 유저'),
        email: String(payload.email ?? ''),
        avatarUrl: payload.picture ?? payload.avatarUrl ?? undefined,
      };
    }
  } catch {
    // 파싱 실패 시 기본값 반환
  }

  // 파싱 실패 또는 비정형 토큰인 경우 기본 유저 반환
  return {
    id: 'mock-user',
    name: '바리스테이션 유저',
    email: '',
    avatarUrl: undefined,
  };
}
