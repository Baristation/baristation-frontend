// Temporary Mock Data for Products Page until backend API is ready

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
    balance: number; // 0 = 미선택
    sweetness: number;
    acidity: number;
  };
  body: 0 | 1 | 2 | 3 | 4 | 5; // 0 = 미선택
  roasting: 0 | 1 | 2 | 3 | 4 | 5; // 0 = 미선택
}

export const DEFAULT_FILTERS: ProductFilterState = {
  flavors: [],
  flavor: { balance: 0, sweetness: 0, acidity: 0 },
  body: 0,
  roasting: 0,
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

export const mockProductsData: ProductInfo[] = [
  {
    id: 1,
    name: 'Colombia Aristides Guarnizo',
    origin: 'HUILA, COLOMBIA',
    primaryFlavor: '과일',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1568815783141-792f9dcc32fd?q=80&w=600&auto=format&fit=crop',
    roasting: 2,
    body: 1,
    acidity: 5,
    balance: 4,
    sweetness: 3,
    link: '/products/1',
    description:
      '안티오키아의 풍부한 화산재 토양에서 자란 이 원두는 복숭아와 리치의 화사한 산미가 특징입니다.',
    roastery: 'Baristation Lab',
    processing: 'Washed',
    variety: 'Caturra',
    altitude: '1,850m',
    category: 'Single Origin',
    blend: false,
    purchaseUrl: 'https://example.com/buy',
    recipe: {
      method: 'Hario V60',
      ratio: '20g coffee : 300g water',
      temp: '93°C',
      grind: 'Medium-Fine',
      notes: '초반 뜸들이기 시간을 충분히 가져가면 복숭아의 단맛을 극대화할 수 있습니다.',
    },
  },
  {
    id: 2,
    name: 'Ethiopia Yirgacheffe Aricha',
    origin: 'YIRGACHEFFE, ETHIOPIA',
    primaryFlavor: '꽃',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1612380635121-411eda9ecbb9?q=80&w=600&auto=format&fit=crop',
    roasting: 1,
    body: 2,
    acidity: 4,
    balance: 5,
    sweetness: 2,
    link: '/products/2',
    description:
      '에티오피아 최고 고도에서 자란 이가체프 아리차는 베리류의 달콤함과 자스민의 향긋함이 어우러진 원두입니다.',
    roastery: 'Flavor Roasters',
    processing: 'Natural',
    variety: 'Heirloom',
    altitude: '2,100m',
    recipe: {
      method: 'Kalita Wave',
      ratio: '18g coffee : 280g water',
      temp: '91°C',
      grind: 'Medium',
      notes: '빠른 추출 속도를 유지하여 자스민의 섬세한 향을 살려보세요.',
    },
  },
  {
    id: 3,
    name: 'Kenya AA Tatu N',
    origin: 'NYERI, KENYA',
    primaryFlavor: '과일',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1639588473831-dd9d014646ae?q=80&w=600&auto=format&fit=crop',
    roasting: 3,
    body: 3,
    balance: 4,
    sweetness: 3,
    acidity: 4,
    link: '/products/3',
  },
  {
    id: 4,
    name: 'Guatemala El Injerto Bourbon',
    origin: 'HUEHUETENANGO, GUATEMALA',
    primaryFlavor: '초콜릿',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1571091799989-e88304d6aed3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    roasting: 4,
    body: 4,
    balance: 3,
    sweetness: 4,
    acidity: 2,
    link: '/products/4',
  },
  {
    id: 5,
    name: 'Brazil Sul de Minas Peaberry',
    origin: 'SUL DE MINAS, BRAZIL',
    primaryFlavor: '캐러멜',
    flavorImageUrl:
      'https://plus.unsplash.com/premium_photo-1695865411429-fc175f8d408d?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    roasting: 3,
    body: 5,
    balance: 4,
    sweetness: 5,
    acidity: 1,
    link: '/products/5',
  },
  {
    id: 6,
    name: 'Sumatra Mandheling G1',
    origin: 'NORTH SUMATRA, INDONESIA',
    primaryFlavor: '스모키',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1621460244277-7038c21f2f32?q=80&w=600&auto=format&fit=crop',
    roasting: 5,
    body: 5,
    balance: 2,
    sweetness: 2,
    acidity: 1,
    link: '/products/6',
  },
  {
    id: 7,
    name: 'Panama Geisha Elida Estate',
    origin: 'BOQUETE, PANAMA',
    primaryFlavor: '꽃',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
    roasting: 1,
    body: 1,
    balance: 5,
    sweetness: 4,
    acidity: 5,
    link: '/products/7',
  },
  {
    id: 8,
    name: 'Yemen Mocha Matari',
    origin: 'BANI MATAR, YEMEN',
    primaryFlavor: '와인',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1474722883778-792e7990302f?q=80&w=691&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    roasting: 3,
    body: 2,
    balance: 4,
    sweetness: 3,
    acidity: 3,
    link: '/products/8',
  },
  {
    id: 9,
    name: 'Costa Rica Tarrazu La Minita',
    origin: 'TARRAZU, COSTA RICA',
    primaryFlavor: '허브',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=600&auto=format&fit=crop',
    roasting: 2,
    body: 3,
    balance: 4,
    sweetness: 3,
    acidity: 3,
    link: '/products/9',
  },
  {
    id: 10,
    name: 'Honduras Marcala SHG',
    origin: 'MARCALA, HONDURAS',
    primaryFlavor: '맥아',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1733276478182-4cc629dadd39?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    roasting: 3,
    body: 3,
    balance: 3,
    sweetness: 3,
    acidity: 2,
    link: '/products/10',
  },
  {
    id: 11,
    name: 'Rwanda Huye Mountain',
    origin: 'HUYE, RWANDA',
    primaryFlavor: '견과',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1508779018996-601e37fa274e?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    roasting: 2,
    body: 2,
    balance: 4,
    sweetness: 4,
    acidity: 3,
    link: '/products/11',
  },
  {
    id: 12,
    name: 'Peru Villa Rica Organic',
    origin: 'CHANCHAMAYO, PERU',
    primaryFlavor: '초콜릿',
    flavorImageUrl:
      'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=600&auto=format&fit=crop',
    roasting: 5,
    body: 4,
    balance: 3,
    sweetness: 3,
    acidity: 2,
    link: '/products/12',
  },
];

/** 클라이언트 사이드 필터 적용 함수 */
export function applyProductFilters(
  products: ProductInfo[],
  filters: ProductFilterState,
  searchQuery: string,
): ProductInfo[] {
  return products.filter((product) => {
    // 검색어 필터
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!product.name.toLowerCase().includes(q) && !product.origin.toLowerCase().includes(q)) {
        return false;
      }
    }
    // 아로마 필터 (다중 선택 → OR 조건)
    if (filters.flavors.length > 0 && !filters.flavors.includes(product.primaryFlavor)) {
      return false;
    }
    // Flavor 필터 (선택된 값과 일치하는 product만 표시)
    if (filters.flavor.balance > 0 && product.balance !== filters.flavor.balance) return false;
    if (filters.flavor.sweetness > 0 && product.sweetness !== filters.flavor.sweetness)
      return false;
    if (filters.flavor.acidity > 0 && product.acidity !== filters.flavor.acidity) return false;
    // 바디감 필터
    if (filters.body > 0 && product.body !== filters.body) return false;
    // 로스팅 필터
    if (filters.roasting > 0 && product.roasting !== filters.roasting) return false;
    return true;
  });
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

  if (filters.flavor.balance > 0) params.set('balance', filters.flavor.balance.toString());
  if (filters.flavor.sweetness > 0) params.set('sweetness', filters.flavor.sweetness.toString());
  if (filters.flavor.acidity > 0) params.set('acidity', filters.flavor.acidity.toString());
  if (filters.body > 0) params.set('body', filters.body.toString());
  if (filters.roasting > 0) params.set('roasting', filters.roasting.toString());

  if (searchQuery.trim()) params.set('q', searchQuery.trim());

  return params;
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
  };

  // flavors 파라미터 처리
  const flavorsParam = params.get('flavors');
  if (flavorsParam) {
    const ids = flavorsParam.split(',');
    filters.flavors = ids
      .map((id) => FLAVOR_DEFINITIONS.find((d) => d.id === id)?.ko)
      .filter(Boolean) as FlavorType[];
  }

  const b = params.get('balance');
  const s = params.get('sweetness');
  const a = params.get('acidity');
  if (b) filters.flavor.balance = parseInt(b, 10);
  if (s) filters.flavor.sweetness = parseInt(s, 10);
  if (a) filters.flavor.acidity = parseInt(a, 10);

  const body = params.get('body');
  if (body) filters.body = parseInt(body, 10) as ProductFilterState['body'];

  const roasting = params.get('roasting');
  if (roasting) filters.roasting = parseInt(roasting, 10) as ProductFilterState['roasting'];

  const searchQuery = params.get('q') || '';

  return { filters, searchQuery };
}
