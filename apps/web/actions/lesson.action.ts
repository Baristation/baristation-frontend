'use server';

import { fetchBackend } from '@/lib/api/backend';
import { LessonDetailResponse, LessonSearchRequest, LessonSearchResponse } from '@/lib/api/lessons';

export async function searchLessonsAction(
  params: LessonSearchRequest,
): Promise<{ success: boolean; data?: LessonSearchResponse['data']; error?: string }> {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const url = `/api/lessons/search?${queryParams.toString()}`;

    const res = await fetchBackend(url, {
      method: 'GET',
    });

    if (!res.ok) {
      console.warn('[searchLessonsAction] Failed to fetch lessons', res.status);
      return { success: false, error: `서버 오류 (${res.status})` };
    }

    const body: LessonSearchResponse = await res.json();

    if (body.statusCode !== '200' || !body.data) {
      return {
        success: false,
        error: body.message || '클래스 검색 결과를 불러오는 데 실패했습니다.',
      };
    }

    return {
      success: true,
      data: body.data,
    };
  } catch (error) {
    console.error('[searchLessonsAction] Error:', error);
    return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
  }
}

export async function getLessonDetailAction(
  lessonId: number,
): Promise<{ success: boolean; data?: LessonDetailResponse['data']; error?: string }> {
  try {
    const res = await fetchBackend(`/api/lessons/${lessonId}`, {
      method: 'GET',
    });

    if (!res.ok) {
      return { success: false, error: `서버 오류 (${res.status})` };
    }

    const body: LessonDetailResponse = await res.json();

    if (body.statusCode !== '200' || !body.data) {
      return {
        success: false,
        error: body.message || '클래스 정보를 불러오는 데 실패했습니다.',
      };
    }

    return { success: true, data: body.data };
  } catch (error) {
    console.error('[getLessonDetailAction] Error:', error);
    return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
  }
}
