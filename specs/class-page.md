# 클래스 목록 페이지 명세서 (Class Page) - Baristation

## 1. 페이지 개요

다양한 핸드드립 및 커피 클래스를 시각적으로 탐색하고, 지역·난이도 필터 및 통합 검색을 통해 사용자의 취향에 맞는 클래스를 발견하도록 유도하는 갤러리형 탐색 페이지입니다.

- **Route**: `/classes`
- **Page Entry**: `apps/web/app/(main)/classes/page.tsx`

---

## 2. 디자인 시스템 참조

모든 디자인 토큰(Color, Typography, Motion)은 [공통 UI 명세서(common-ui-spec.md)](common-ui-spec.md)를 기반으로 합니다.

**페이지 무드: "Sensory Discovery"** — 고감도 이미지 카드가 갤러리처럼 펼쳐지며, 바리스타의 전문성과 클래스의 분위기가 첫눈에 전달되도록 구성합니다.

---

## 3. 페이지 레이아웃 구조

```text
[Desktop (≥1024px)]
┌──────────────────────────────────────────────┐
│  GlobalNav                                   │
│──────────────────────────────────────────────│
│  ┌──────────────────────────────────────────┐│
│  │  ClassFilterBar                          ││  ← 통합 필터/검색 바 (지역 select + 난이도 select + 검색어 input + 검색 버튼)
│  └──────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────┐│
│  │  ClassCardList (3열 그리드)              ││  ← 카드 갤러리
│  │  ClassCard × N                           ││
│  └──────────────────────────────────────────┘│
│  [ 클래스 더 보기 ]                           │  ← Load More 버튼
└──────────────────────────────────────────────┘

[Mobile (<1024px)]
┌──────────────────────────┐
│  GlobalNav               │
│──────────────────────────│
│  ┌────────────────────┐  │
│  │ [지역Sel] [난이도Sel]│  │  ← 지역, 난이도가 가로로 나란히 한 행에 배치
│  │ [   검색어 Input  ]│  │
│  │ [  검색하기 Button ]│  │
│  └────────────────────┘  │
│  ClassCardList (1열)     │
│  [ 클래스 더 보기 ]      │
└──────────────────────────┘
```

---

## 4. 컴포넌트 명세 (Component Specs)

---

### ClassFilterBar (검색/필터 통합 바)

#### 1. Overview (맥락)

- **목적**: 지역 선택 드롭다운, 난이도 선택 드롭다운, 키워드 검색 인풋, 검색 실행 버튼을 하나로 묶은 통합 필터/검색 관리 컴포넌트
- **위치**: `apps/web/components/class/ClassFilterBar.tsx`
- **부모 컴포넌트**: `classes/page.tsx`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: Tailwind CSS v4, `lucide-react` (`Search`, `ChevronDown`)
- **기타 제약**:
  - 사용자가 필터를 바꾼 즉시 상위 쿼리를 요청하지 않음 (로컬 상태로 보관).
  - 우측의 **"클래스 검색하기"** 버튼을 클릭하거나 검색 인풋 창에서 **Enter 키**를 누를 때만 상위 컴포넌트로 변경된 필터/검색 조건이 전달되어 최종 검색이 실행됨.

#### 3. Data Interface (I/O)

**Props**:

```ts
type DifficultyType = '전체' | '입문' | '중급' | '고급';

interface ClassFilterState {
  region: string | null;
  difficulty: DifficultyType;
}

interface ClassFilterBarProps {
  filters: ClassFilterState;
  onChangeFilters: (filters: ClassFilterState) => void;
  searchQuery: string;
  onChangeSearch: (query: string) => void;
  onSearchSubmit: () => void;
  availableRegions: string[];
}
```

**State**:

- `localSearch: string` (입력 중인 검색어 로컬 상태)
- `localRegion: string | null` (선택된 지역 로컬 상태)
- `localDifficulty: DifficultyType` (선택된 난이도 로컬 상태)

**Events / Callbacks**:

- `handleSubmit()`: 엔터 입력 혹은 버튼 클릭 시 `onChangeFilters`, `onChangeSearch`, `onSearchSubmit`를 호출하여 일괄 적용

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건   | UI 표현                                                            |
| ----------- | ------------- | ------------------------------------------------------------------ |
| **Default** | 초기 렌더링   | 회색 계열(`bg-[#F8F8F8]`) 둥근 카드 배경 + 지역, 난이도, 검색 라벨 |
| **Focus**   | 입력창 포커스 | 테두리 focus링 효과 적용                                           |

#### 5. Functional Requirements (단계별 요구사항)

1. **라벨 한글화**: `지역`, `난이도`, `검색` 라벨을 노출한다.
2. **난이도 및 지역 Select 적용**: 두 필터 모두 `<select>` 드롭다운 박스로 제공하여 시각적 디자인 통일성을 극대화한다.
3. **지연 검색 반영 (On-Submit)**: 드롭다운이나 검색창 입력 등 모든 제어는 내부 로컬 상태로만 업데이트되며, 오직 검색 버튼 클릭 또는 Enter 입력 시에만 상위 쿼리를 갱신한다.
4. **모바일 반응형 1행 배치**: 모바일 화면에서는 `지역`과 `난이도` 드롭다운 박스가 가로로 나란히 배치되어 화면의 상하 폭을 아낀다.

#### 6. Design Spec (디자인 명세)

- **Layout**: `w-full`, `rounded-2xl`, `bg-[#F8F8F8]`, `p-4 md:p-5 flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-5`
- **Region & Difficulty**: 모바일 `flex-1`을 가진 가로형 정렬, 데스크톱 `lg:w-44 lg:flex-none`
- **Typography**: `Inter`, `Outfit`, `text-sm`, 라벨 `text-[11px] font-bold text-gray-500 uppercase tracking-wider`
- **Responsive**: 모바일에서는 수직 정렬이지만 지역/난이도는 1행으로 유지, 데스크톱은 가로로 일렬 배치

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 필터 선택 및 키워드 입력 후 "클래스 검색하기"를 누르기 전엔 API 호출이 차단된다.
- [ ] (기능) 엔터 또는 버튼 클릭 시에만 검색 결과가 업데이트된다.
- [ ] (반응형) 모바일 뷰포트에서 지역과 난이도가 가로로 같은 행에 나란히 배치된다.

---

### ClassCardList

#### 1. Overview (맥락)

- **목적**: 필터·검색 결과에 맞는 클래스 카드 목록을 반응형 그리드로 렌더링하는 컨테이너 컴포넌트
- **위치**: `apps/web/components/class/ClassCardList.tsx`
- **부모 컴포넌트**: `classes/page.tsx`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `framer-motion`, Tailwind CSS v4, `TanStack Query`
- **기타 제약**: 무한 스크롤 대신 "클래스 더 보기" 버튼을 통한 Load More 방식 사용

#### 3. Data Interface (I/O)

**Props**:

```ts
interface LessonSummary {
  lessonId: number;
  lessonImageUrl: string;
  title: string;
  subTitle: string;
  difficulty: '입문' | '중급' | '고급';
  hostName: string;
  hostProfileUrl: string;
  region: string;
  city: string;
  place: string;
  nextDate: string | null; // ISO datetime
  price: number;
}

interface ClassCardListProps {
  lessons: LessonSummary[];
  isLoading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
}
```

**State**: 없음 (상위 `page.tsx`에서 관리)

#### 4. UI States (상태 명세)

| 상태            | 트리거 조건               | UI 표현                         |
| --------------- | ------------------------- | ------------------------------- |
| **Default**     | 데이터 정상 로드          | 클래스 카드 반응형 그리드       |
| **Loading**     | `isLoading: true`         | Skeleton 카드 그리드 (9개)      |
| **LoadingMore** | `isLoadingMore: true`     | 기존 카드 유지 + 하단 스피너    |
| **Empty**       | `lessons` 배열이 비어있음 | 빈 상태 안내 + 필터 초기화 유도 |
| **Error**       | API 요청 실패             | 에러 메시지 + 재시도 버튼       |

#### 5. Functional Requirements (단계별 요구사항)

1. `lessons` 배열을 순서대로 `ClassCard`로 렌더링한다
2. `isLoading: true` 시 Skeleton 카드를 9개 그리드 형태로 표시한다
3. `lessons` 배열이 비어있을 때 "조건에 맞는 클래스가 없습니다" 안내 문구와 필터 초기화 버튼을 중앙에 표시한다
4. 스크롤 진입 시 카드가 stagger 효과와 함께 순차적으로 페이드인된다
5. `hasNext: true`일 때 하단에 "클래스 더 보기" 버튼을 노출하며, 클릭 시 `onLoadMore()`을 호출한다

#### 6. Design Spec (디자인 명세)

- **Layout**: CSS Grid, `gap-6`
- **Animation** (`framer-motion`):
  - 래퍼: `AnimatePresence`
  - 효과: 카드 `staggerChildren: 0.07s`, 각 카드 `y: 20px → 0`, `opacity: 0 → 1`
  - Duration: `0.4s`, Easing: `easeOut`
- **Load More Button**: `bg-surface-card border border-border-subtle rounded-2xl px-8 py-3 text-text-muted hover:text-amber-400 hover:border-amber-500 transition-all`
- **Responsive**:
  - Mobile (`< 768px`): 1열 그리드
  - Tablet (`768px ~ 1024px`): 2열 그리드
  - Desktop (`≥ 1024px`): 3열 그리드

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 클래스 카드 목록이 그리드로 정상 렌더링된다
- [ ] (기능) 로딩 시 Skeleton 카드가 9개 표시된다
- [ ] (기능) 빈 결과 시 안내 문구가 중앙에 표시된다
- [ ] (기능) "클래스 더 보기" 클릭 시 추가 카드가 로드된다
- [ ] (인터랙션) 스크롤 진입 시 카드가 stagger 페이드인된다
- [ ] (반응형) Mobile 1열 / Tablet 2열 / Desktop 3열 그리드가 동작한다

---

### ClassCard

#### 1. Overview (맥락)

- **목적**: 단일 클래스를 이미지 중심으로 표현하며 바리스타 프로필, 난이도, 일정, 가격 등 핵심 정보를 제공하는 카드 컴포넌트
- **위치**: `apps/web/components/class/ClassCard.tsx`
- **부모 컴포넌트**: `ClassCardList`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `next/image`, `next/link`, `framer-motion`, Tailwind CSS v4, `lucide-react` (`MapPin`, `CalendarDays`, `Star`, `ChevronRight`)
- **스타일링 규칙**: `VisualCard` 패턴 준수, `object-cover`로 전체 영역 채움
- **가독성 규칙**: 하단 그라데이션 오버레이 필수 적용

#### 3. Data Interface (I/O)

```ts
interface ClassCardProps {
  lessonId: number;
  lessonImageUrl: string;
  title: string;
  subTitle: string;
  difficulty: '입문' | '중급' | '고급';
  hostName: string;
  hostProfileUrl: string;
  region: string;
  city: string;
  place: string;
  nextDate: string | null;
  price: number;
  index?: number; // stagger 애니메이션 딜레이 계산용
}
```

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건 | UI 표현                                                    |
| ----------- | ----------- | ---------------------------------------------------------- |
| **Default** | 초기 렌더링 | 풀-사이즈 배경 이미지 + 하단 그라데이션 + 정보 텍스트      |
| **Hover**   | 마우스 오버 | 카드 부유(`y: -6px`) + 이미지 확대(`scale-105`) + 오버레이 |

#### 5. Functional Requirements (단계별 요구사항)

1. `lessonImageUrl`을 카드 전체 배경으로 사용한다 (`fill`, `object-cover`)
2. 이미지 좌상단에 **바리스타 프로필 이미지**(원형, 32×32px)와 **이름**을 오버레이로 표시한다
3. 이미지 우상단에 **난이도 배지**(`입문` / `중급` / `고급`)를 표시한다
4. 하단 50% 영역에 `black/80 → transparent` 그라데이션을 적용하여 텍스트 가독성을 확보한다
5. 텍스트 영역(좌측 하단)에 클래스 제목, 장소(`MapPin` 아이콘 + `city · place`), 다음 일정(`CalendarDays` 아이콘), 가격을 순서대로 배치한다
6. `nextDate`가 null인 경우 "일정 미정"으로 표시한다
7. 카드 클릭 시 `/classes/{lessonId}` 경로로 라우팅한다

#### 6. Design Spec (디자인 명세)

- **Layout**: `aspect-[4/5]`, `rounded-3xl`, `overflow-hidden`, `relative`, `cursor-pointer`
- **Overlay**: 하단 `linear-gradient(to top, black/80, transparent)`
- **Difficulty Badge**:
  - `입문`: `bg-emerald-500/80 text-white`
  - `중급`: `bg-amber-500/80 text-white`
  - `고급`: `bg-rose-500/80 text-white`
  - 공통: `rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm`
- **Host Profile**: `rounded-full ring-2 ring-white/50 w-8 h-8 object-cover`
- **Typography**:
  - 클래스명: `font-playfair text-xl font-bold text-white leading-tight`
  - 장소/일정: `font-inter text-xs text-white/70`
  - 가격: `font-outfit text-lg font-bold text-amber-400`
- **Animation** (`framer-motion`):
  - 마운트: `y: 20 → 0`, `opacity: 0 → 1`, Duration `0.4s easeOut`, Delay `index * 0.07s`
  - 호버: `y: -6px`, 이미지 `scale: 1.05`, Duration `0.3s easeOut`
- **Responsive**: 부모 그리드 셀 내 `w-full`

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 카드 클릭 시 `/classes/{lessonId}`로 라우팅된다
- [ ] (기능) `nextDate`가 null일 경우 "일정 미정"이 표시된다
- [ ] (디자인) 하단 텍스트가 어떤 배경 이미지 위에서도 명확히 읽힌다
- [ ] (디자인) 난이도 배지가 색상으로 구분된다
- [ ] (인터랙션) 호버 시 이미지 확대와 카드 부유 효과가 동시에 조화롭게 일어난다
- [ ] (반응형) 그리드 내에서 카드 비율(`4:5`)이 깨지지 않는다

---

## 5. 아키텍처 요약

```text
classes/page.tsx (Server Component - 초기 데이터 페칭)
  ├── ClassFilterBar          ← 통합 검색/필터 드롭다운 바 (Client)
  └── ClassCardList           ← 카드 그리드 컨테이너 (Client)
        └── ClassCard × N     ← 단일 클래스 카드
```

**상태 관리**: `classes/page.tsx`에서 TanStack Query로 `filters`와 `searchQuery`를 기반으로 데이터를 페칭하며, `useInfiniteQuery`로 Load More를 구현합니다.

```ts
// 필터 상태 구조
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState<ClassFilterState>({
  region: null,
  difficulty: '전체',
});

// TanStack Query
const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
  queryKey: ['lessons', filters, searchQuery],
  queryFn: ({ pageParam = 0 }) =>
    fetchLessons({ ...filters, keyword: searchQuery, page: pageParam }),
  getNextPageParam: (lastPage) =>
    lastPage.data.page.hasNext ? lastPage.data.page.number + 1 : undefined,
});
```

---

## 6. API 연동 명세

### 클래스 목록 조회

```http
GET /api/lesson/search
```

**Query Parameters**:

| Parameter    | Type     | Description                    | 필수 |
| ------------ | -------- | ------------------------------ | ---- |
| `region`     | `string` | 지역 필터 (예: "서울", "부산") | ✗    |
| `difficulty` | `string` | 난이도 Enum (입문/중급/고급)   | ✗    |
| `keyword`    | `string` | 통합 검색 키워드               | ✗    |
| `page`       | `number` | 페이지 번호 (0부터 시작)       | ✗    |
| `size`       | `number` | 페이지 당 항목 수 (기본 9)     | ✗    |

**Response Body**:

```ts
interface LessonSearchResponse {
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
```

---

## 7. 핵심 동작 요구사항

- **갤러리 우선**: 이미지가 카드 전체를 차지하며, 텍스트는 최소화하여 시각적 몰입감을 유지
- **지연 필터/검색 반영**: 옵션을 선택하거나 키워드를 입력한 후 우측 "클래스 검색하기"를 클릭해야만 리프레시 수행
- **Load More 방식**: UX 맥락 유지를 위해 무한 스크롤 대신 명시적 버튼으로 추가 로드
- **Mock 지원**: 백엔드 미연동 시 `src/mocks/lessons.ts`의 Mock 데이터로 동작 가능
