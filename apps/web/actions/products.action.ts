'use server';

import { fetchBackend } from '@/lib/api/backend';
import {
  ProductDetailResponse,
  ProductSearchRequest,
  ProductSearchResponse,
} from '@/lib/api/products';

export async function searchProductsAction(
  params: ProductSearchRequest,
): Promise<{ success: boolean; data?: ProductSearchResponse['data']; error?: string }> {
  try {
    // params를 URLSearchParams로 변환
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

    const url = `/api/products/search?${queryParams.toString()}`;

    const res = await fetchBackend(url, {
      method: 'GET',
    });

    if (!res.ok) {
      console.warn('[searchProductsAction] Failed to fetch products', res.status);
      return { success: false, error: `서버 오류 (${res.status})` };
    }

    const body: ProductSearchResponse = await res.json();

    if (body.statusCode !== '200' || !body.data) {
      return { success: false, error: body.message || '검색 결과를 불러오는 데 실패했습니다.' };
    }

    return {
      success: true,
      data: body.data,
    };
  } catch (error) {
    console.error('[searchProductsAction] Error:', error);
    return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
  }
}

export async function getProductDetailAction(
  id: number,
): Promise<{ success: boolean; data?: ProductDetailResponse['data']; error?: string }> {
  try {
    const res = await fetchBackend(`/api/products/${id}`, {
      method: 'GET',
    });
    if (!res.ok) {
      return { success: false };
    }
    const body: ProductDetailResponse = await res.json();

    if (body.statusCode !== '200' || !body.data) {
      return {
        success: false,
        error: body.message || '상품 정보를 불러오는 데 실패했습니다.',
      };
    }

    return { success: true, data: body.data };
  } catch (error) {
    console.error('[getProductDetailAction] Error:', error);
    return { success: false, error: '서버 통신 중 오류가 발생했습니다.' };
  }
}
