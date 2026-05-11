import { NextResponse } from 'next/server';

/**
 * @deprecated `getUserAction` Server Action으로 교체되었습니다.
 * `@/actions/auth-actions`의 `getUserAction()`을 사용하세요.
 *
 * 이 라우트는 하위 호환성을 위해 잠시 유지되며, 추후 제거될 예정입니다.
 */
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use getUserAction() server action instead.' },
    { status: 410 },
  );
}
