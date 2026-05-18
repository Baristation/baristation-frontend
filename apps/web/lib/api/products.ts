// API Types for Products Page

export interface FlavorNoteDTO {
  flavorNoteId: number;
  flavorCategory: string;
  nameKo: string;
  nameEn: string | null;
  flavorImageUrl: string;
}

export interface ProductImageDTO {
  productImageId: number;
  imageType: 'THUMB' | 'SUB';
  imageUrl: string;
  sortOrder: number;
}

export interface BeanSummaryDTO {
  productId: number;
  beanNameKo: string;
  beanNameEn: string;
  origin: string;
  region: string;
  process: string;
  productImage: ProductImageDTO | null;
}

export interface RoasterDTO {
  roasterId: number;
  nameKo: string;
  nameEn: string;
  homepageUrl: string;
  description: string;
}

export interface ProductDetailDTO {
  beanSummary: BeanSummaryDTO;
  roaster: RoasterDTO;
  roastingType: string;
  flavorNotes: FlavorNoteDTO[];
  description: string;
  agtronMin: number | null;
  agtronMax: number | null;
  acidity: number | null;
  sweetness: number | null;
  body: number | null;
  balance: number | null;
  images: ProductImageDTO[];
}

export interface ProductDetailResponse {
  statusCode: string;
  message: string;
  data: ProductDetailDTO;
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
  roasting?: number;
  body?: number;
  acidity?: number;
  sweetness?: number;
  balance?: number;
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
  minBody?: number;
  maxBody?: number;
  minBalance?: number;
  maxBalance?: number;
  roastingType?: string;
  sortBy?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// FLAVOR_CATEGORY_MAP removed as it was unused and replaced by FLAVOR_DEFINITIONS.

/**
 * API 검색 결과를 UI용 ProductInfo 형식으로 변환합니다.
 * 백엔드에서 평점 데이터(roasting, body 등)를 제공하지 않을 경우 null/undefined가 될 수 있습니다.
 */
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
    primaryFlavor: FLAVOR_DEFINITIONS.find((f) => f.ko === item.flavorNotes?.nameKo)?.id || 'OTHER',
    flavorImageUrl: imageUrl,
    roasting: (item.roasting as RoastingType) ?? 3,
    body: (item.body as BodyType) ?? 3,
    balance: item.balance ?? 3,
    sweetness: item.sweetness ?? 3,
    acidity: item.acidity ?? 3,
    link: `/products/${item.productId}`,
  };
}

export type FlavorType =
  | 'FRUITY'
  | 'FLORAL'
  | 'SWEET'
  | 'BROWN_SUGAR'
  | 'CHOCOLATY'
  | 'NUTTY'
  | 'SPICE'
  | 'ROASTED'
  | 'FERMENTED'
  | 'GREEN_VEGETATIVE'
  | 'EARTHY'
  | 'WOODY'
  | 'CHEMICAL'
  | 'SAVORY'
  | 'MOUTHFEEL'
  | 'DEFECT'
  | 'OTHER';

export interface FlavorDefinition {
  id: FlavorType;
  ko: string;
  emoji: string;
  imageUrl?: string;
}

export const FLAVOR_DEFINITIONS: FlavorDefinition[] = [
  { id: 'FRUITY', ko: '과일', emoji: '🍋' },
  { id: 'FLORAL', ko: '꽃', emoji: '🌸' },
  // { id: 'SWEET', ko: '단맛', emoji: '🍬' },
  // { id: 'BROWN_SUGAR', ko: '브라운 슈가', emoji: '🟤' },
  { id: 'CHOCOLATY', ko: '초콜릿', emoji: '🍫' },
  { id: 'NUTTY', ko: '견과류', emoji: '🥜' },
  { id: 'SPICE', ko: '스파이스', emoji: '🌶️' },
  // { id: 'ROASTED', ko: '로스티드', emoji: '☕' },
  { id: 'FERMENTED', ko: '발효', emoji: '🍷' },
  { id: 'GREEN_VEGETATIVE', ko: '허브/채소', emoji: '🌿' },
  { id: 'EARTHY', ko: '흙', emoji: '🌍' },
  { id: 'WOODY', ko: '나무', emoji: '🪵' },
  // { id: 'CHEMICAL', ko: '화학적', emoji: '🧪' },
  { id: 'SAVORY', ko: '감칠맛', emoji: '🧂' },
  // { id: 'MOUTHFEEL', ko: '바디감', emoji: '🥛' },
  // { id: 'DEFECT', ko: '결함', emoji: '⚠️' },
  // { id: 'OTHER', ko: '기타', emoji: '❓' },
];

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
  roasting: string | null; // 단일 Enum 값 (LIGHT, MEDIUMLIGHT, MEDIUM, MEDIUMDARK, DARK) 또는 null (all)
}

export const DEFAULT_FILTERS: ProductFilterState = {
  flavors: [],
  flavor: { balance: [1, 5], sweetness: [1, 5], acidity: [1, 5] },
  body: [1, 5],
  roasting: null,
};

export const FLAVOR_BG_CLASS: Record<string, string> = {
  FRUITY: 'bg-flavor-fruit',
  CHOCOLATY: 'bg-flavor-chocolate',
};

export const VALID_ROASTING_TYPES = [
  'LIGHT',
  'MEDIUMLIGHT',
  'MEDIUM',
  'MEDIUMDARK',
  'DARK',
] as const;
export type RoastingFilterValue = (typeof VALID_ROASTING_TYPES)[number];

/** 로스팅 타입이 유효한지 검증하는 타입 가드 */
export function isValidRoastingType(val: any): val is RoastingFilterValue {
  return VALID_ROASTING_TYPES.includes(val);
}

/** 수치 지표 범위를 정제하고 검증하는 헬퍼 함수 */
export function sanitizeRange(
  range: any,
  minDefault: number = 1,
  maxDefault: number = 5,
  domainMin: number = 0,
  domainMax: number = 5,
): [number, number] {
  if (!Array.isArray(range) || range.length !== 2) {
    return [minDefault, maxDefault];
  }

  let min = Number(range[0]);
  let max = Number(range[1]);

  // NaN 또는 유한하지 않은 값 처리
  if (!Number.isFinite(min)) min = minDefault;
  if (!Number.isFinite(max)) max = maxDefault;

  // 도메인 범위로 제한 (Clamping)
  min = Math.max(domainMin, Math.min(domainMax, min));
  max = Math.max(domainMin, Math.min(domainMax, max));

  // 하한값이 상한값보다 큰 경우 스왑
  if (min > max) {
    const temp = min;
    min = max;
    max = temp;
  }

  return [min, max];
}

/** 필터 상태를 URL Query String으로 인코딩 */
export function encodeFiltersToParams(
  filters: ProductFilterState,
  searchQuery: string,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.flavors.length > 0) {
    params.set('flavors', filters.flavors.join(','));
  }

  if (filters.flavor.balance[0] !== 1 || filters.flavor.balance[1] !== 5)
    params.set('balance', filters.flavor.balance.join('-'));
  if (filters.flavor.sweetness[0] !== 1 || filters.flavor.sweetness[1] !== 5)
    params.set('sweetness', filters.flavor.sweetness.join('-'));
  if (filters.flavor.acidity[0] !== 1 || filters.flavor.acidity[1] !== 5)
    params.set('acidity', filters.flavor.acidity.join('-'));
  if (filters.body[0] !== 1 || filters.body[1] !== 5) params.set('body', filters.body.join('-'));

  // 로스팅 선택 상태가 존재할 경우 roastingType으로 URL 파라미터 저장
  if (filters.roasting) {
    params.set('roastingType', filters.roasting);
  }

  if (searchQuery.trim()) params.set('q', searchQuery.trim());

  return params;
}

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
    // 다중 선택 시 첫 번째 향미를 flavorCategory로 전달
    req.flavorCategory = filters.flavors[0];
  }

  // 맛 프로필 파라미터 필수화 (null 여부: X) - 항상 기본값 또는 설정된 범위를 포함하여 전송 (살균 처리)
  const [minAcidity, maxAcidity] = sanitizeRange(filters.flavor.acidity);
  req.minAcidity = minAcidity;
  req.maxAcidity = maxAcidity;

  const [minSweetness, maxSweetness] = sanitizeRange(filters.flavor.sweetness);
  req.minSweetness = minSweetness;
  req.maxSweetness = maxSweetness;

  const [minBody, maxBody] = sanitizeRange(filters.body);
  req.minBody = minBody;
  req.maxBody = maxBody;

  const [minBalance, maxBalance] = sanitizeRange(filters.flavor.balance);
  req.minBalance = minBalance;
  req.maxBalance = maxBalance;

  // 로스팅 선택 상태가 존재하고 Whitelist에 포함된 경우 roastingType 추가
  if (filters.roasting && isValidRoastingType(filters.roasting)) {
    req.roastingType = filters.roasting;
  }

  return req;
}

/** URL Query String을 필터 상태로 디코딩 */
export function decodeParamsToFilters(params: URLSearchParams): {
  filters: ProductFilterState;
  searchQuery: string;
} {
  const filters: ProductFilterState = {
    ...DEFAULT_FILTERS,
    flavors: [...DEFAULT_FILTERS.flavors],
    flavor: { ...DEFAULT_FILTERS.flavor },
    body: [...DEFAULT_FILTERS.body],
    roasting: DEFAULT_FILTERS.roasting,
  };

  const flavorsParam = params.get('flavors');
  if (flavorsParam) {
    filters.flavors = flavorsParam.split(',') as FlavorType[];
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
  if (b) filters.flavor.balance = sanitizeRange(b);
  if (s) filters.flavor.sweetness = sanitizeRange(s);
  if (a) filters.flavor.acidity = sanitizeRange(a);

  const body = parseRange(params.get('body'));
  if (body) filters.body = sanitizeRange(body);

  // URL에서 roastingType 파라미터를 읽어와 유효한지 검증 후 디코딩
  const roastingTypeParam = params.get('roastingType');
  if (roastingTypeParam && isValidRoastingType(roastingTypeParam)) {
    filters.roasting = roastingTypeParam;
  }

  const searchQuery = params.get('q') || '';

  return { filters, searchQuery };
}
