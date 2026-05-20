import { FLAVOR_DEFINITIONS, FlavorType, ProductInfo, RoastingType, BodyType } from './products';

// 북마크된 상품 응답의 아이템 타입 (ProductSearchItem과 유사함)
export interface BookmarkItem {
  productId: number;
  beanNameKo: string;
  beanNameEn: string;
  origin: string;
  region: string;
  process: string;
  productImage: {
    productImageId: number;
    imageType: 'THUMB' | 'SUB';
    imageUrl: string;
    sortOrder: number;
  } | null;
  flavorNoteDTO: {
    flavorNoteId: number;
    flavorCategory: string;
    nameKo: string;
    nameEn: string | null;
    flavorImageUrl: string;
  } | null;
}

export interface BookmarkResponse {
  statusCode: string;
  message: string;
  data: {
    content: BookmarkItem[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface BookmarkToggleResponse {
  statusCode: string;
  message: string;
  data: null;
}

/**
 * 북마크 API 응답 결과를 UI용 ProductInfo 형식으로 변환합니다.
 */
export function mapBookmarkItemToProductInfo(item: BookmarkItem): ProductInfo {
  const imageUrl =
    item.productImage?.imageUrl ||
    item.flavorNoteDTO?.flavorImageUrl ||
    '/images/default-product.png';

  const primaryFlavor =
    FLAVOR_DEFINITIONS.find((f) => f.ko === item.flavorNoteDTO?.nameKo)?.id || 'OTHER';

  return {
    id: item.productId,
    name: item.beanNameKo,
    origin: item.origin,
    primaryFlavor: primaryFlavor as FlavorType,
    flavorImageUrl: imageUrl,
    roasting: 3 as RoastingType, // 북마크 API는 현재 상세 수치를 반환하지 않으므로 기본값 사용
    body: 3 as BodyType,
    balance: 3,
    sweetness: 3,
    acidity: 3,
    link: `/products/${item.productId}`,
    isBookmarked: true, // 북마크 리스트에서 가져온 아이템은 무조건 북마크되어 있음
  };
}
