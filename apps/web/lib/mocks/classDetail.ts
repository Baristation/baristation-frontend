export interface LessonImage {
  lessonImageId: number;
  imageType: 'THUMB' | 'DETAIL';
  imageUrl: string;
  sortOrder: number;
}

export interface CurriculumItem {
  title: string;
  subTitle: string;
  sortOrder: number;
}

export interface LessonDetail {
  lessonId: number;
  lessonImages: LessonImage[];
  title: string;
  hostName: string;
  hostProfileUrl: string;
  careers: string[];
  region: string;
  city: string;
  place: string;
  schedules: string[];
  duration: number;
  curriculum: CurriculumItem[];
  price: number;
  remainingSeats: number; // 목 데이터용 추가 필드 (백엔드 확인 필요)
}

export interface LessonDetailResponse {
  statusCode: string;
  message: string;
  data: LessonDetail;
}

const MOCK_LESSON_DETAILS: Record<number, LessonDetail> = {
  1: {
    lessonId: 1,
    lessonImages: [
      {
        lessonImageId: 1,
        imageType: 'THUMB',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
        sortOrder: 0,
      },
      {
        lessonImageId: 2,
        imageType: 'DETAIL',
        imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=1200&q=80',
        sortOrder: 1,
      },
      {
        lessonImageId: 3,
        imageType: 'DETAIL',
        imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=80',
        sortOrder: 2,
      },
    ],
    title: '핸드드립 기초: 완벽한 한 잔을 위한 물줄기 조절',
    hostName: '김민재 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    careers: [
      'SCA Certified Professional',
      'Korea Brewers Cup 2022 준우승',
      '10년 경력 스페셜티 바리스타',
    ],
    region: '서울',
    city: '성수동',
    place: '에스프레소 바',
    schedules: [
      '2025-07-15T14:00:00',
      '2025-07-22T14:00:00',
      '2025-07-29T14:00:00',
      '2025-08-05T14:00:00',
      '2025-08-12T14:00:00',
    ],
    duration: 120,
    curriculum: [
      {
        title: 'Theory: 원두와 추출의 이해',
        subTitle:
          '커피 원두의 산지별 특징과 로스팅 포인트에 따른 적정 추출 온도를 학습합니다. 다양한 원두 샘플을 직접 향으로 비교해봅니다.',
        sortOrder: 1,
      },
      {
        title: 'Practical: 정밀한 물줄기 컨트롤',
        subTitle:
          '푸어오버 기술의 핵심인 물줄기의 굵기와 속도를 일정하게 유지하는 실전 연습을 진행합니다. 드립 포트 선택과 그립 방법도 함께 배웁니다.',
        sortOrder: 2,
      },
      {
        title: 'Tasting: 감각의 확장',
        subTitle:
          '추출된 커피를 테이스팅하며 과소 추출과 과다 추출의 차이를 미각으로 구분해봅니다. 자신의 취향에 맞는 레시피를 찾아갑니다.',
        sortOrder: 3,
      },
    ],
    price: 55000,
    remainingSeats: 3,
  },
  2: {
    lessonId: 2,
    lessonImages: [
      {
        lessonImageId: 4,
        imageType: 'THUMB',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80',
        sortOrder: 0,
      },
      {
        lessonImageId: 5,
        imageType: 'DETAIL',
        imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200&q=80',
        sortOrder: 1,
      },
    ],
    title: '홈 로스팅 & 커핑: 나만의 시그니처 블렌딩',
    hostName: '이수현 로스터',
    hostProfileUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    careers: ['Q-Grader 자격증 보유', 'SCAA Member', '로스터리 5년 운영'],
    region: '서울',
    city: '망원동',
    place: '로스터리',
    schedules: ['2025-07-20T11:00:00', '2025-08-03T11:00:00', '2025-08-17T11:00:00'],
    duration: 180,
    curriculum: [
      {
        title: 'Green Bean Selection: 생두 고르기',
        subTitle:
          '생두의 등급과 종류, 산지별 특성을 학습하고 좋은 생두를 직접 선별하는 방법을 배웁니다.',
        sortOrder: 1,
      },
      {
        title: 'Roasting: 배전도의 과학',
        subTitle:
          '홈 로스터를 이용하여 직접 원두를 로스팅하고, 배전도(라이트~다크)에 따른 향미 변화를 관찰합니다.',
        sortOrder: 2,
      },
      {
        title: 'Cupping: 전문가 테이스팅',
        subTitle:
          'SCA 표준 커핑 방식으로 직접 로스팅한 원두를 평가하고, 블렌딩 레시피를 개발합니다.',
        sortOrder: 3,
      },
    ],
    price: 75000,
    remainingSeats: 7,
  },
  3: {
    lessonId: 3,
    lessonImages: [
      {
        lessonImageId: 6,
        imageType: 'THUMB',
        imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=1200&q=80',
        sortOrder: 0,
      },
      {
        lessonImageId: 7,
        imageType: 'DETAIL',
        imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1200&q=80',
        sortOrder: 1,
      },
    ],
    title: '에스프레소 마스터 클래스: 완벽한 크레마의 비밀',
    hostName: '박준호 바리스타',
    hostProfileUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    careers: ['WBC 한국 대표 선발전 진출', 'SCA Barista Level 2', '부산 스페셜티 커피 협회 회원'],
    region: '부산',
    city: '해운대',
    place: '카페 라보',
    schedules: [
      '2025-07-18T15:00:00',
      '2025-07-25T15:00:00',
      '2025-08-01T15:00:00',
      '2025-08-08T15:00:00',
    ],
    duration: 150,
    curriculum: [
      {
        title: 'Machine Mastery: 에스프레소 머신 이해',
        subTitle:
          '반자동 에스프레소 머신의 구조와 원리를 파악하고, 그라인더 조절부터 머신 유지보수까지 배웁니다.',
        sortOrder: 1,
      },
      {
        title: 'Tamping: 탬핑의 기술',
        subTitle:
          '균일한 압력의 탬핑이 에스프레소 품질에 미치는 영향을 이해하고, 올바른 탬핑 자세와 압력을 익힙니다.',
        sortOrder: 2,
      },
      {
        title: 'Extraction: 황금 비율 찾기',
        subTitle:
          '도스, 수율, 시간의 삼각관계를 이해하고 다양한 변수 조절로 자신의 완벽한 에스프레소 레시피를 완성합니다.',
        sortOrder: 3,
      },
    ],
    price: 65000,
    remainingSeats: 2,
  },
};

// 존재하지 않는 lessonId는 lessonId=1의 데이터를 기본값으로 반환
function getDetailOrDefault(lessonId: number): LessonDetail {
  return (
    MOCK_LESSON_DETAILS[lessonId] ?? {
      ...MOCK_LESSON_DETAILS[1],
      lessonId,
    }
  );
}

export async function fetchLessonDetail(lessonId: number): Promise<LessonDetailResponse> {
  await new Promise((r) => setTimeout(r, 400));

  const data = getDetailOrDefault(lessonId);

  return {
    statusCode: '200',
    message: '',
    data,
  };
}
