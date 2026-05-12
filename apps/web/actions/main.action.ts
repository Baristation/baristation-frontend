'use server';

import { fetchBackend } from '@/lib/api/backend';
import {
  FlavorNote,
  MainApiResponse,
  MainData,
  MainFlavorResponse,
  MainProductResponse,
  RecommendedProduct,
} from '@/lib/api/main';
import { FlavorType } from '@/lib/api/products';

export async function getMainDataAction(): Promise<{ success: boolean; data?: MainData }> {
  try {
    const res = await fetchBackend('/api/main', {
      method: 'GET',
      next: { revalidate: 60 * 5 }, // 5분 캐싱
    });

    if (!res.ok) {
      console.warn('[getMainDataAction] Failed to fetch main data', res.status);
      return { success: false };
    }

    const body: MainApiResponse = await res.json();

    if (body.statusCode !== '200' || !body.data) {
      return { success: false };
    }

    const rawFlavors = body.data.flavors || [];
    const rawProducts = body.data.products || [];

    const flavors: FlavorNote[] = rawFlavors.map((f: MainFlavorResponse) => ({
      id: f.flavor_id.toString(),
      name: f.flavor_name,
      imageUrl: f.flavor_image_url,
      link: f.flavor_link,
    }));

    const recommendedProducts: RecommendedProduct[] = rawProducts.map((p: MainProductResponse) => ({
      id: p.product_id,
      name: p.product_name,
      origin: '로스터리 제공',
      primaryFlavor: (p.product_flavor && p.product_flavor.length > 0
        ? p.product_flavor[0]
        : '캐러멜') as FlavorType,
      flavorImageUrl: p.product_image_link || '/images/default-product.png',
      link: p.product_link,
      balance: 3,
      sweetness: 3,
      acidity: 3,
      body: 3,
      roasting: 3,
    }));

    return {
      success: true,
      data: { flavors, recommendedProducts },
    };
  } catch (error) {
    console.error('[getMainDataAction] Error fetching main data:', error);
    return { success: false };
  }
}
