'use server';

import { cookies } from 'next/headers';

import { fetchBackend } from '@/lib/api/backend';
import { BookmarkResponse, BookmarkToggleResponse } from '@/lib/api/bookmarks';
import { AUTH_TOKEN_KEY } from '@/lib/utils/auth';

import { getUserAction } from './auth.action';

export async function getBookmarksAction(
  page: number = 0,
  size: number = 12,
): Promise<{ success: boolean; data?: BookmarkResponse['data']; error?: string }> {
  try {
    const { user } = await getUserAction();

    if (!user) {
      return { success: false, error: '로그인이 필요한 서비스입니다.' };
    }

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    const url = `/api/mypage/${user.id}/bookmarks?${queryParams.toString()}`;

    const res = await fetchBackend(url, {
      method: 'GET',
    });

    if (!res.ok) {
      console.warn('[getBookmarksAction] Failed to fetch bookmarks', res.status);
      return { success: false, error: `서버 오류 (${res.status})` };
    }

    const body: BookmarkResponse = await res.json();

    if (body.statusCode !== '200' || !body.data) {
      return { success: false, error: body.message || '북마크 목록을 불러오는 데 실패했습니다.' };
    }

    return {
      success: true,
      data: body.data,
    };
  } catch (error) {
    console.error('[getBookmarksAction] Error:', error);
    return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
  }
}

export async function toggleBookmarkAction(
  productId: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(AUTH_TOKEN_KEY)?.value;

    if (!accessToken) {
      return { success: false, error: '로그인이 필요한 서비스입니다.' };
    }

    const url = `/api/bookmarks/${productId}`;

    // According to the prompt, this is a toggle endpoint or we can just send POST for toggle
    // Assuming POST for toggle
    const res = await fetchBackend(url, {
      method: 'POST',
    });

    if (!res.ok) {
      console.warn('[toggleBookmarkAction] Failed to toggle bookmark', res.status);
      return { success: false, error: `서버 오류 (${res.status})` };
    }

    const body: BookmarkToggleResponse = await res.json();

    if (body.statusCode !== '200') {
      return { success: false, error: body.message || '북마크 토글에 실패했습니다.' };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('[toggleBookmarkAction] Error:', error);
    return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
  }
}
