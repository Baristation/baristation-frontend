export type DifficultyType = '전체' | '입문' | '중급' | '전문가';

export interface LessonSummary {
  lessonId: number;
  lessonImageUrl: string;
  title: string;
  subTitle: string;
  difficulty: '입문' | '중급' | '전문가';
  hostName: string;
  hostProfileUrl: string;
  region: string;
  city: string;
  place: string;
  nextDate: string | null;
  price: number;
}

export interface LessonSearchParams {
  region: string | null;
  difficulty: DifficultyType;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface LessonSearchResponse {
  statusCode: string;
  message: string;
  data: {
    content: LessonSummary[];
    page: {
      number: number;
      size: number;
      totalElements: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

export const availableRegions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '경기'];

const MOCK_LESSONS: LessonSummary[] = [
  {
    lessonId: 1,
    lessonImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    title: '핸드드립 기초: 완벽한 한 잔을 위한 물줄기 조절',
    subTitle:
      '기초적인 추출 원리부터 원두별 적정 온도까지, 초보자를 위한 전문적인 브루잉 가이드를 제공합니다.',
    difficulty: '입문',
    hostName: '김민재 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    region: '서울',
    city: '성수동',
    place: '에스프레소 바',
    nextDate: '2025-07-15T14:00:00',
    price: 55000,
  },
  {
    lessonId: 2,
    lessonImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    title: '홈 로스팅 & 커핑: 나만의 시그니처 블렌딩',
    subTitle:
      '생두 선택부터 배전도에 따른 향미 변화까지 로스팅의 기초를 체험하고 커핑을 통해 테이스팅을 익힙니다.',
    difficulty: '전문가',
    hostName: '이수현 로스터',
    hostProfileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    region: '서울',
    city: '망원동',
    place: '로스터리',
    nextDate: '2025-07-20T11:00:00',
    price: 75000,
  },
  {
    lessonId: 3,
    lessonImageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80',
    title: '에스프레소 마스터 클래스: 완벽한 크레마의 비밀',
    subTitle:
      '에스프레소 머신 조작법부터 탬핑 기술, 추출 변수 조절까지 전문가 수준의 노하우를 전수합니다.',
    difficulty: '중급',
    hostName: '박준호 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    region: '부산',
    city: '해운대',
    place: '카페 라보',
    nextDate: '2025-07-18T15:00:00',
    price: 65000,
  },
  {
    lessonId: 4,
    lessonImageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    title: '라떼 아트 입문: 하트에서 로제타까지',
    subTitle:
      '우유 스티밍의 기초부터 시작하여 기본적인 라떼 아트 패턴을 직접 만들어보는 실습 위주의 클래스입니다.',
    difficulty: '입문',
    hostName: '최지연 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    region: '서울',
    city: '강남',
    place: '아트 카페',
    nextDate: '2025-07-22T13:00:00',
    price: 48000,
  },
  {
    lessonId: 5,
    lessonImageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80',
    title: '스페셜티 커피 테이스팅: 산지별 풍미 여행',
    subTitle:
      '에티오피아, 콜롬비아, 파나마 등 세계 각지의 스페셜티 원두를 비교 테이스팅하며 커피 감각을 키웁니다.',
    difficulty: '중급',
    hostName: '정태양 Q-Grader',
    hostProfileUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&q=80',
    region: '대구',
    city: '동성로',
    place: '카핑 랩',
    nextDate: '2025-07-25T14:00:00',
    price: 70000,
  },
  {
    lessonId: 6,
    lessonImageUrl: 'https://images.unsplash.com/photo-1523475496153-3b2b7a62c23a?w=800&q=80',
    title: '콜드브루 마스터: 저온 추출의 과학',
    subTitle:
      '찬물 추출의 원리와 다양한 방식(침출식, 적하식)을 이해하고, 맛있는 콜드브루를 직접 만들어 집에서도 즐길 수 있도록 합니다.',
    difficulty: '입문',
    hostName: '한소연 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    region: '인천',
    city: '송도',
    place: '브루 스튜디오',
    nextDate: '2025-08-01T10:00:00',
    price: 42000,
  },
  {
    lessonId: 7,
    lessonImageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80',
    title: '사이폰 커피의 미학: 과학과 예술의 만남',
    subTitle:
      '진공 기압을 이용한 독특한 추출 방식인 사이폰 커피의 원리를 배우고, 투명한 커피 추출 과정을 직접 경험합니다.',
    difficulty: '중급',
    hostName: '오재현 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=200&q=80',
    region: '서울',
    city: '홍대',
    place: '사이폰 카페',
    nextDate: '2025-08-05T16:00:00',
    price: 60000,
  },
  {
    lessonId: 8,
    lessonImageUrl: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=800&q=80',
    title: '커피 블렌딩 워크샵: 나만의 레시피 개발',
    subTitle: '여러 산지의 원두를 조합하여 자신만의 블렌드를 개발하는 창의적인 실습 클래스입니다.',
    difficulty: '전문가',
    hostName: '강민철 로스터',
    hostProfileUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    region: '부산',
    city: '서면',
    place: '블렌드 웍스',
    nextDate: null,
    price: 90000,
  },
  {
    lessonId: 9,
    lessonImageUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=800&q=80',
    title: '에어로프레스 챔피언십 기법 공개',
    subTitle:
      '세계 에어로프레스 챔피언십 우승자의 레시피와 기법을 배우고, 다양한 추출 변수를 실험합니다.',
    difficulty: '중급',
    hostName: '윤서현 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&q=80',
    region: '서울',
    city: '연남동',
    place: '에어로 랩',
    nextDate: '2025-08-10T13:00:00',
    price: 58000,
  },
  {
    lessonId: 10,
    lessonImageUrl: 'https://images.unsplash.com/photo-1519082274554-1ca37f0e5a7e?w=800&q=80',
    title: '터키시 커피: 동방의 커피 문화 체험',
    subTitle:
      '체즈베를 이용한 전통 터키식 커피 제조법과 커피 문화를 배우고, 커피로 점을 보는 독특한 전통도 경험합니다.',
    difficulty: '입문',
    hostName: '임예진 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    region: '경기',
    city: '수원',
    place: '동방 카페',
    nextDate: '2025-08-15T11:00:00',
    price: 45000,
  },
  {
    lessonId: 11,
    lessonImageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
    title: '이탈리아 바 문화: 진정한 에스프레소 바리스타',
    subTitle:
      '이탈리아 정통 에스프레소 문화를 이해하고 카운터에서 단시간에 완벽한 에스프레소를 서빙하는 기술을 습득합니다.',
    difficulty: '전문가',
    hostName: '서동준 헤드바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=200&q=80',
    region: '서울',
    city: '이태원',
    place: '바르 이탈리아노',
    nextDate: '2025-08-20T14:00:00',
    price: 85000,
  },
  {
    lessonId: 12,
    lessonImageUrl: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=800&q=80',
    title: '모닝 커피 루틴: 15분으로 하루를 시작하는 브루잉',
    subTitle:
      '바쁜 아침에도 맛있는 커피를 즐길 수 있는 효율적인 핸드드립 루틴과 간단한 원두 보관법을 배웁니다.',
    difficulty: '입문',
    hostName: '노유진 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    region: '광주',
    city: '충장로',
    place: '모닝 브루',
    nextDate: '2025-08-22T09:00:00',
    price: 38000,
  },
];

function filterLessons(lessons: LessonSummary[], params: LessonSearchParams): LessonSummary[] {
  let result = [...lessons];

  if (params.region) {
    result = result.filter((l) => l.region === params.region);
  }
  if (params.difficulty && params.difficulty !== '전체') {
    result = result.filter((l) => l.difficulty === params.difficulty);
  }
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    result = result.filter(
      (l) =>
        l.title.toLowerCase().includes(kw) ||
        l.hostName.toLowerCase().includes(kw) ||
        l.region.toLowerCase().includes(kw) ||
        l.city.toLowerCase().includes(kw),
    );
  }

  return result;
}

export async function fetchLessons(params: LessonSearchParams): Promise<LessonSearchResponse> {
  // 목 데이터이므로 200ms 지연 시뮬레이션
  await new Promise((r) => setTimeout(r, 300));

  const PAGE_SIZE = params.size ?? 9;
  const page = params.page ?? 0;

  const filtered = filterLessons(MOCK_LESSONS, params);
  const totalElements = filtered.length;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const content = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return {
    statusCode: '200',
    message: '',
    data: {
      content,
      page: {
        number: page,
        size: PAGE_SIZE,
        totalElements,
        totalPages,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
      },
    },
  };
}
