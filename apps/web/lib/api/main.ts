import { type ProductInfo } from './products';

// Backend Response Types
export interface MainFlavorResponse {
  flavor_id: number;
  flavor_name: string;
  flavor_image_url: string;
  flavor_link: string;
}

export interface MainProductResponse {
  product_id: number;
  product_name: string;
  product_flavor: string[];
  product_image_link: string;
  product_link: string;
}

export interface MainApiResponseData {
  flavors: MainFlavorResponse[];
  products: MainProductResponse[];
}

export interface MainApiResponse {
  statusCode: string;
  message: string;
  data: MainApiResponseData;
}

// Frontend Types
export interface FlavorNote {
  id: string; // 영문 ID (예: 'caramel')
  name: string; // 한국어 명칭 (예: '캐러멜')
  imageUrl: string;
  link: string;
}

/**
 * RecommendedProduct - 메인 페이지용 추천 원두 타입.
 * ProductInfo의 핵심 필드를 포함하여 ProductCard와 호환되도록 구성합니다.
 */
export interface RecommendedProduct
  extends Pick<
    ProductInfo,
    'id' | 'name' | 'origin' | 'primaryFlavor' | 'flavorImageUrl' | 'link'
  > {}

export interface MainData {
  flavors: FlavorNote[];
  recommendedProducts: RecommendedProduct[];
}
