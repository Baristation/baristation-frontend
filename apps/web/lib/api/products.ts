// API Types for Products Page

export interface FlavorNoteDTO {
  flavorNoteId: number;
  flavorCategory: string;
  nameKo: string;
  nameEn: string;
  flavorImageUrl: string;
}

export interface ProductImageDTO {
  productImageId: number;
  imageType: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ProductSearchItem {
  productId: number;
  beanNameKo: string;
  beanNameEn: string;
  origin: string;
  region: string;
  process: string;
  productImage: ProductImageDTO | null;
  flavorNotes: FlavorNoteDTO;
}

export interface PageInfo {
  currentPage: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ProductSearchResponse {
  statusCode: string;
  message: string;
  data: {
    content: ProductSearchItem[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ProductSearchRequest {
  keyword?: string;
  flavorCategory?: string;
  minAcidity?: number;
  maxAcidity?: number;
  minSweetness?: number;
  maxSweetness?: number;
  minBitterness?: number;
  maxBitterness?: number;
  body?: number;
  roastingType?: string;
  sortBy?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const FLAVOR_CATEGORY_MAP: Record<string, string> = {
  캐러멜: 'BROWN_SUGAR',
  와인: 'WINE',
  초콜릿: 'CHOCOLATY',
  과일: 'FRUITY',
  허브: 'HERBAL',
  맥아: 'MALTY',
  견과: 'NUTTY',
  꽃: 'FLORAL',
  스모키: 'SMOKY',
};

export function mapSearchItemToProductInfo(item: ProductSearchItem): ProductInfo {
  // 상품 이미지가 없을 경우 향미 이미지를 보여주도록 설정
  const imageUrl =
    item.productImage?.imageUrl ||
    item.flavorNotes?.flavorImageUrl ||
    '/images/default-product.png';

  return {
    id: item.productId,
    name: item.beanNameKo,
    origin: item.origin,
    primaryFlavor: (item.flavorNotes?.nameKo as FlavorType) || '캐러멜',
    flavorImageUrl: imageUrl,
    roasting: 3,
    body: 3,
    balance: 3,
    sweetness: 3,
    acidity: 3,
    link: `/products/${item.productId}`,
  };
}

export interface FlavorDefinition {
  id: string; // 영문 ID (예: 'caramel')
  ko: string; // 한국어 명칭 (예: '캐러멜')
  imageUrl: string; // 기본 이미지 URL
}

export const FLAVOR_DEFINITIONS: FlavorDefinition[] = [
  {
    id: 'wine',
    ko: '와인',
    imageUrl:
      'https://images.unsplash.com/photo-1474722883778-792e7990302f?q=80&w=691&auto=format&fit=crop',
  },
  {
    id: 'herb',
    ko: '허브',
    imageUrl:
      'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'floral',
    ko: '꽃',
    imageUrl:
      'https://images.unsplash.com/photo-1612380635121-411eda9ecbb9?q=80&w=687&auto=format&fit=crop',
  },
  {
    id: 'malt',
    ko: '맥아',
    imageUrl:
      'https://images.unsplash.com/photo-1733276478182-4cc629dadd39?q=80&w=1170&auto=format&fit=crop',
  },
  {
    id: 'nutty',
    ko: '견과',
    imageUrl:
      'https://images.unsplash.com/photo-1508779018996-601e37fa274e?q=80&w=687&auto=format&fit=crop',
  },
  {
    id: 'fruit',
    ko: '과일',
    imageUrl:
      'https://images.unsplash.com/photo-1639588473831-dd9d014646ae?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'caramel',
    ko: '캐러멜',
    imageUrl:
      'https://plus.unsplash.com/premium_photo-1695865411429-fc175f8d408d?q=80&w=688&auto=format&fit=crop',
  },
  {
    id: 'smoky',
    ko: '스모키',
    imageUrl:
      'https://images.unsplash.com/photo-1621460244277-7038c21f2f32?q=80&w=687&auto=format&fit=crop',
  },
  {
    id: 'chocolate',
    ko: '초콜릿',
    imageUrl:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=600&auto=format&fit=crop',
  },
];

export type FlavorType =
  | '캐러멜'
  | '와인'
  | '초콜릿'
  | '과일'
  | '허브'
  | '맥아'
  | '견과'
  | '꽃'
  | '스모키';

export type RoastingType = 1 | 2 | 3 | 4 | 5; // 1: Light, 5: Dark
export type BodyType = 1 | 2 | 3 | 4 | 5; // 1: Light, 5: Heavy

export interface ProductInfo {
  id: number;
  name: string;
  origin: string;
  primaryFlavor: FlavorType;
  flavorImageUrl: string;
  roasting: RoastingType;
  body: BodyType;
  /** 밸런스 1~5 */
  balance: number;
  /** 단맛 1~5 */
  sweetness: number;
  /** 산미 1~5 */
  acidity: number;
  link: string;
  /** 상세 추가 정보 */
  description?: string; // 원두 소개
  roastery?: string; // 로스터리 명
  processing?: string; // 가공 방식 (Natural, Washed 등)
  variety?: string; // 품종
  altitude?: string; // 재배 고도
  category?: string; // 예: 'Single Origin', 'Decaf'
  blend?: boolean; // 혼합 여부
  purchaseUrl?: string; // 외부 구매 링크
  recipe?: {
    method: string; // 추출 기구 (V60, Chemex 등)
    ratio: string; // 비율 (예: 1:15)
    temp: string; // 물 온도
    grind: string; // 분쇄도
    notes: string; // 추출 팁
  };
}

export interface ProductFilterState {
  flavors: FlavorType[];
  flavor: {
    balance: [number, number];
    sweetness: [number, number];
    acidity: [number, number];
  };
  body: [number, number];
  roasting: [number, number];
}

export const DEFAULT_FILTERS: ProductFilterState = {
  flavors: [],
  flavor: { balance: [1, 5], sweetness: [1, 10], acidity: [1, 10] },
  body: [1, 5],
  roasting: [1, 5],
};

/** FlavorType → Tailwind 배경 클래스 매핑 */
export const FLAVOR_BG_CLASS: Record<FlavorType, string> = {
  캐러멜: 'bg-flavor-caramel',
  와인: 'bg-flavor-wine',
  초콜릿: 'bg-flavor-chocolate',
  과일: 'bg-flavor-fruit',
  허브: 'bg-flavor-herb',
  맥아: 'bg-flavor-malt',
  견과: 'bg-flavor-nutty',
  꽃: 'bg-flavor-floral',
  스모키: 'bg-flavor-smoky',
};

export const FLAVOR_TYPES: FlavorType[] = FLAVOR_DEFINITIONS.map((def) => def.ko as FlavorType);
export const ROASTING_TYPES: RoastingType[] = [1, 2, 3, 4, 5];
export const BODY_TYPES: BodyType[] = [1, 2, 3, 4, 5];

export function getFlavorById(id: string) {
  return FLAVOR_DEFINITIONS.find((def) => def.id === id);
}

export function getFlavorByKoName(ko: string) {
  return FLAVOR_DEFINITIONS.find((def) => def.ko === ko);
}

/** 필터 상태를 URL Query String으로 인코딩 */
export function encodeFiltersToParams(
  filters: ProductFilterState,
  searchQuery: string,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.flavors.length > 0) {
    const flavorCodes = filters.flavors
      .map((ko) => FLAVOR_DEFINITIONS.find((d) => d.ko === ko)?.id)
      .filter(Boolean)
      .join(',');
    if (flavorCodes) params.set('flavors', flavorCodes);
  }

  if (filters.flavor.balance[0] !== 1 || filters.flavor.balance[1] !== 5)
    params.set('balance', filters.flavor.balance.join('-'));
  if (filters.flavor.sweetness[0] !== 1 || filters.flavor.sweetness[1] !== 10)
    params.set('sweetness', filters.flavor.sweetness.join('-'));
  if (filters.flavor.acidity[0] !== 1 || filters.flavor.acidity[1] !== 10)
    params.set('acidity', filters.flavor.acidity.join('-'));
  if (filters.body[0] !== 1 || filters.body[1] !== 5) params.set('body', filters.body.join('-'));
  if (filters.roasting[0] !== 1 || filters.roasting[1] !== 5)
    params.set('roasting', filters.roasting.join('-'));

  if (searchQuery.trim()) params.set('q', searchQuery.trim());

  return params;
}

/**
 * 클라이언트의 필터 상태를 백엔드 API 요청 파라미터로 변환합니다.
 */
export function mapFiltersToApiRequest(
  filters: ProductFilterState,
  searchQuery: string,
  page: number = 0,
  size: number = 12,
): ProductSearchRequest {
  const req: ProductSearchRequest = { page, size };

  if (searchQuery.trim()) {
    req.keyword = searchQuery.trim();
  }

  if (filters.flavors.length > 0) {
    const mappedCategory = FLAVOR_CATEGORY_MAP[filters.flavors[0] as string];
    if (mappedCategory) req.flavorCategory = mappedCategory;
  }

  if (filters.flavor.acidity[0] !== 1 || filters.flavor.acidity[1] !== 10) {
    req.minAcidity = filters.flavor.acidity[0];
    req.maxAcidity = filters.flavor.acidity[1];
  }

  if (filters.flavor.sweetness[0] !== 1 || filters.flavor.sweetness[1] !== 10) {
    req.minSweetness = filters.flavor.sweetness[0];
    req.maxSweetness = filters.flavor.sweetness[1];
  }

  // 바디감은 현재 단일 값만 API 명세에 명시되어 있으나, 만약 min/max가 생기면 확장이 필요할 수 있습니다.
  // API 스펙 상 바디는 단일 값이므로, 평균값 혹은 범위를 벗어났을 때만 할당하도록 보수적으로 접근
  if (filters.body[0] === filters.body[1]) {
    req.body = filters.body[0];
  }

  return req;
}

/** URL Query String을 필터 상태로 디코딩 */
export function decodeParamsToFilters(params: URLSearchParams): {
  filters: ProductFilterState;
  searchQuery: string;
} {
  // 깊은 복사로 기본값 가져오기
  const filters: ProductFilterState = {
    ...DEFAULT_FILTERS,
    flavors: [...DEFAULT_FILTERS.flavors],
    flavor: { ...DEFAULT_FILTERS.flavor },
    body: [...DEFAULT_FILTERS.body],
    roasting: [...DEFAULT_FILTERS.roasting],
  };

  // flavors 파라미터 처리
  const flavorsParam = params.get('flavors');
  if (flavorsParam) {
    const ids = flavorsParam.split(',');
    filters.flavors = ids
      .map((id) => FLAVOR_DEFINITIONS.find((d) => d.id === id)?.ko)
      .filter(Boolean) as FlavorType[];
  }

  const parseRange = (val: string | null): [number, number] | null => {
    if (!val) return null;
    const parts = val.split('-');
    if (parts.length === 2) {
      return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
    }
    return null;
  };

  const b = parseRange(params.get('balance'));
  const s = parseRange(params.get('sweetness'));
  const a = parseRange(params.get('acidity'));
  if (b) filters.flavor.balance = b;
  if (s) filters.flavor.sweetness = s;
  if (a) filters.flavor.acidity = a;

  const body = parseRange(params.get('body'));
  if (body) filters.body = body;

  const roasting = parseRange(params.get('roasting'));
  if (roasting) filters.roasting = roasting;

  const searchQuery = params.get('q') || '';

  return { filters, searchQuery };
}
