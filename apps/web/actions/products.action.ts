'use server';

import { fetchBackend } from '@/lib/api/backend';
import { ProductSearchRequest, ProductSearchResponse } from '@/lib/api/products';

export async function searchProductsAction(
  params: ProductSearchRequest,
): Promise<{ success: boolean; data?: ProductSearchResponse['data'] }> {
  try {
    // params를 URLSearchParams로 변환
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const url = `/api/products/search?${queryParams.toString()}`;

    const res = await fetchBackend(url, {
      method: 'GET',
    });

    if (!res.ok) {
      console.warn('[searchProductsAction] Failed to fetch products', res.status);
      return { success: false };
    }

    const body: ProductSearchResponse = await res.json();

    if (body.statusCode !== '200' || !body.data) {
      return { success: false };
    }

    return {
      success: true,
      data: body.data,
    };
  } catch (error) {
    console.error('[searchProductsAction] Error:', error);
    return { success: false };
  }
}

export async function getProductDetailAction(
  id: number,
): Promise<{ success: boolean; data?: any }> {
  try {
    const res = await fetchBackend(`/api/products/${id}`, {
      method: 'GET',
    });
    if (!res.ok) {
      return { success: false };
    }
    const body = await res.json();
    return { success: true, data: body.data };
  } catch (error) {
    return { success: false };
  }
}
