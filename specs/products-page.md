# 원두 정보 페이지 명세서 (Products Page) - Baristation

## 1. 페이지 개요

Baristation 서비스의 원두 정보 탐색(Product Discovery) 페이지입니다. 사용자가 커피 프로파일(향, 맛, 바디, 로스팅) 기준으로 원두를 필터링하고 원하는 원두를 탐색할 수 있도록 지원합니다.

---

## 2. 디자인 시스템 참조

모든 디자인 토큰(Color, Typography, Motion)은 [공통 UI 명세서(common-ui-spec.md)](common-ui-spec.md)를 기반으로 합니다.

**페이지 무드: "Sensory Catalogue"** — 마치 고급 커피 카탈로그를 넘기듯, 여백과 이미지 중심의 구성으로 각 원두의 개성이 직접 말을 걸도록 합니다.

### 아로마별 배경 색상 토큰 (FlavorColor Palette)

아로마 요소에서 색상을 추출하여 ProductCard 배경에 적용합니다.

| 아로마 | 대표 식재료     | 배경 색상 (HEX) | Tailwind 커스텀 클래스 |
| ------ | --------------- | --------------- | ---------------------- |
| 캐러멜 | 캐러멜 설탕     | `#F2D49B`       | `bg-flavor-caramel`    |
| 와인   | 레드 베리       | `#E8C5C0`       | `bg-flavor-wine`       |
| 초콜릿 | 다크 초콜릿     | `#C9A882`       | `bg-flavor-chocolate`  |
| 과일   | 시트러스/복숭아 | `#FDDCB5`       | `bg-flavor-fruit`      |
| 허브   | 민트/허브 잎    | `#C9E4CA`       | `bg-flavor-herb`       |
| 맥아   | 보리/곡물       | `#E8D9B5`       | `bg-flavor-malt`       |
| 견과   | 아몬드/헤이즐넛 | `#E0CAAA`       | `bg-flavor-nutty`      |
| 꽃     | 자스민/장미     | `#F5D5D5`       | `bg-flavor-floral`     |
| 스모크 | 훈연 우드       | `#D0CEC8`       | `bg-flavor-smoky`      |

---

## 3. 페이지 레이아웃 구조

```text
[Desktop / Tablet (≥768px)]
┌─────────────────────────────────────────┐
│  GlobalNav                              │
│─────────────────────────────────────────│
│  ┌──────────┐  ┌───────────────────────┐│
│  │ Filter   │  │  [ 필터 정보/요약 ]   ││  ← 그리드 상단
│  │ Panel    │  │  ProductCardList         ││  ← 본문 영역
│  │ ├─[검색] │  │  (원두 카드 그리드)    ││
│  │ ├─Flavor  │  │                       ││
│  │ └─Flavor │  └───────────────────────┘│
│  └──────────┘                           │
└─────────────────────────────────────────┘

[Mobile (<768px)]
┌──────────────────────┐
│  GlobalNav           │
│──────────────────────│
│  [결과 수] [필터 버튼]│  ← 그리드 상단
│  ProductCardList        │  ← 기본 뷰
│  (원두 카드 그리드)   │
└──────────────────────┘
       ↕ (필터 버튼 클릭 시 Drawer 오버레이)
┌──────────────────────┐
│  [ProductFilterDrawer]  │  ← 하단에서 상단으로 슬라이드
│  ├─[ 검색 ]          │  ← 드로어 내부 상단
│  ├─Flavor             │
│  └─Flavor            │
└──────────────────────┘
```

---

## 4. 컴포넌트 명세 (Component Specs)

---

### ProductSearchBar

#### 1. Overview (맥락)

- **목적**: 원두 이름 또는 키워드로 원두 목록을 실시간 필터링하는 검색 입력 컴포넌트
- **위치**: `apps/web/components/products/ProductSearchBar.tsx`
- **부모 컴포넌트**: `ProductFilterPanel`, `ProductFilterDrawer`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: Tailwind CSS v4, `lucide-react` (`Search` 아이콘)
- **기타 제약**: Live Search(자동 반영) 대신 성능과 사용자 경험을 고려하여 Enter 키 입력 시에만 실행 (Debounce 제거)

#### 3. Data Interface (I/O)

**Props**:

```ts
interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; // 기본값: "검색어를 입력하세요"
}
```

**State**: `localValue: string` (입력 중인 미확정 상태 보유)

**Events / Callbacks**:

- `onChange(value: string)`: Enter 키 입력 또는 초기화 시 상위로 전달 (Commit 시점에만 호출)

#### 4. UI States (상태 명세)

| **Default** | 초기 렌더링 | 흰색 배경 입력창 + Search 아이콘 + 테두리 |
| **Focus** | 입력창 포커스 | 테두리 강조 + 아이콘 색상 변경 |
| **Filled** | 텍스트 입력 중 | 우측에 Clear(×) 버튼 노출 |

#### 5. Functional Requirements (단계별 요구사항)

1. `Search` 아이콘이 입력창 좌측에 위치한다
2. 텍스트 입력 후 Enter 키를 눌렀을 때만 `onChange`를 호출한다
3. 입력값이 있을 때 우측에 Clear(×) 버튼을 노출하며, 클릭 시 즉각 `onChange("")`를 호출한다
4. 포커스 시 테두리가 `Brand-Amber #D97706`으로 전환된다

#### 6. Design Spec (디자인 명세)

- **Layout**: `w-full`, `rounded-xl`, `h-12`, 좌측 아이콘 + 입력 텍스트 + 우측 Clear 버튼
- **Background**: `bg-white`, `ring-1 ring-gray-300`, `shadow-sm`
- **Animation**: 포커스 시 `ring-2 ring-amber-500 transition-shadow` (0.2s)
- **Typography**: `Outfit`, Regular, `text-sm`, placeholder 색상 `text-gray-500`
- **Responsive**: 다양한 부모 컨테이너(패널/드로어) 너비에 맞게 `w-full`로 꽉 채움

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 입력 후 Enter 키 입력 시에만 `onChange`가 호출된다
- [ ] (기능) Clear 버튼 클릭 시 입력값이 즉각적으로 초기화된다
- [ ] (디자인) 포커스 시 `Brand-Amber` 링 효과가 적용된다
- [ ] (반응형) 부모 컨테이너(패널/드로어) 내부 너비에 알맞게 늘어나거나 줄어든다

---

### ProductFilterPanel

#### 1. Overview (맥락)

- **목적**: 데스크톱/태블릿에서 좌측 사이드바로 항상 노출되는 커피 프로파일 필터 패널
- **위치**: `apps/web/components/products/ProductFilterPanel.tsx`
- **부모 컴포넌트**: `products/page.tsx`
- **노출 조건**: 뷰포트 너비 ≥ 768px

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: Tailwind CSS v4, `framer-motion`
- **기타 제약**: 모바일에서는 렌더링하지 않음 (`hidden md:block`)

#### 3. Data Interface (I/O)

**Props**:

```ts
interface ProductFilterState {
  flavors: FlavorType[]; // 선택된 아로마 (다중 선택)
  flavor: {
    balance: number; // 밸런스 1~5 (0 = 미선택)
    sweetness: number; // 단맛 1~5 (0 = 미선택)
    acidity: number; // 산미 1~5 (0 = 미선택)
  };
  body: 0 | 1 | 2 | 3 | 4 | 5; // 바디감 0 = 미선택, 1~5
  roasting: 0 | 1 | 2 | 3 | 4 | 5; // 로스팅 0 = 미선택, 1~5
}

type FlavorType =
  | '캐러멜'
  | '와인'
  | '초콜릿'
  | '과일'
  | '허브'
  | '맥아'
  | '견과'
  | '꽃'
  | '스모크';
type RoastingType = 1 | 2 | 3 | 4 | 5;

interface ProductFilterPanelProps {
  filters: ProductFilterState;
  onChange: (filters: ProductFilterState) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}
```

**State**: `localFilters: ProductFilterState` (미요청 필터 상태 보유)

**Events / Callbacks**:

- `onChange(filters)`: "적용하기" 버튼 클릭 시 최종 변경 사항을 상위로 전달
- `onReset()`: 전체 필터 초기화

#### 4. UI States (상태 명세)

| 상태         | 트리거 조건         | UI 표현                                  |
| ------------ | ------------------- | ---------------------------------------- |
| **Default**  | 초기 렌더링         | 모든 필터 비활성 상태                    |
| **Filtered** | 하나 이상 필터 선택 | 선택된 항목 강조 + 상단 초기화 버튼 노출 |

#### 5. Functional Requirements (단계별 요구사항)

1. **Search** 구역: 패널 최상단에 `ProductSearchBar`를 포함하여 이름/원산지 검색 연동
2. **Flavor (향)** 섹션: 9개 아로마 타입을 Chip 형태로 나열, 다중 선택 가능
3. **Flavor (맛)** 섹션: **산미·단맛·밸런스**를 각 연속된 N등분 막대 형태(Rating Bar) 1~5단계로 표시
4. **Body (바디감)** 섹션: 1(매우 가벼움) ~ 5(매우 묵직함) Rating Bar 5단계로 확장 표시
5. **Roasting** 섹션: 1(Light) ~ 5(Dark) Rating Bar 5단계로 확장 표시 (단계: Light, Light Medium, Medium, Medium Dark, Dark)
6. 모든 필터링 조작은 즉시 반영되지 않고 `localFilters` 상태만 갱신한다
7. 하단에 스티키(Sticky)하게 자리잡은 "적용하기" 버튼을 클릭할 때 `onChange(localFilters)`를 호출하여 상위 컨텍스트에 반영한다
8. 하나 이상의 필터가 선택되면 상단에 "초기화" 버튼이 노출된다
9. 초기화 버튼 클릭 시 `onReset()`을 호출하여 모든 필터를 해제한다

#### 6. Design Spec (디자인 명세)

- **Layout**: `w-[240px] shrink-0`, 수직 스크롤 가능, 섹션 간 `pb-6 border-b border-gray-100`
- **Flavor Chip**: `rounded-full px-3 py-1 text-xs`, 선택 시 `bg-amber-500 text-white font-semibold shadow-sm`, 미선택 시 `bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300`
- **Rating Bar**: 마디별 테두리 적용(`border border-gray-200/50`), 값이 높을수록 진한 색상(`amber-200`~`amber-600`), 미선택 마디는 `bg-gray-50`
- **Roasting Chip**: Flavor Chip과 동일 스타일
- **Typography**: 섹션 타이틀 `Outfit SemiBold text-xs uppercase tracking-widest text-gray-500`, 바디감 수치 텍스트는 타이틀과 동일 선상 우측 배치
- **Apply Button**: 패널 최하단에 스티키(`sticky bottom-0`)하게 배치되며 `w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-white` 속성 적용
- **Animation** (`framer-motion`): Chip 선택 시 `scale: 0.95 → 1.0` 0.1s 튕김 효과

#### 7. Definition of Done (검증 기준)

- [ ] (기능) Flavor Chip 다중 선택 및 해제가 정상 동작한다
- [ ] (기능) Flavor Rating Bar가 1~5 단계 선택을 처리하며 점차 진한 색으로 표기된다
- [ ] (기능) Body Rating Bar가 1~5 단계 선택을 처리하며 점차 진한 색으로 표기된다
- [ ] (기능) Roasting Rating Bar가 1~5 단계 선택을 처리하며 점차 진한 색으로 표기된다
- [ ] (기능) 초기화 버튼 클릭 시 모든 필터가 해제된다
- [ ] (기능) "적용하기" 버튼 클릭 시에만 필터 변경 사항이 부모로 전달된다
- [ ] (디자인) "적용하기" 버튼이 스크롤 시에도 패널 최하단에 스티키하게 고정된다
- [ ] (반응형) 모바일(`< 768px`)에서 렌더링되지 않는다

---

### ProductFilterDrawer

#### 1. Overview (맥락)

- **목적**: 모바일 화면에서 필터 버튼 클릭 시 화면 하단에서 상단으로 슬라이드되어 올라오는 Drawer 형태의 필터 패널
- **위치**: `apps/web/components/products/ProductFilterDrawer.tsx`
- **부모 컴포넌트**: `products/page.tsx`
- **노출 조건**: 뷰포트 너비 < 768px, 필터 버튼 클릭 시

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `framer-motion`, Tailwind CSS v4
- **기타 제약**: 하단 "취소하기" 버튼, Drawer 외부 영역 클릭(Backdrop) 또는 아래로 드래그하여 닫힘, 컨텐츠는 `ProductFilterPanel`과 동일한 필터 UI 공유

#### 3. Data Interface (I/O)

**Props**:

```ts
interface ProductFilterDrawerProps {
  isOpen: boolean;
  filters: ProductFilterState; // ProductFilterPanel과 동일 타입
  onChange: (filters: ProductFilterState) => void;
  onReset: () => void;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}
```

**State**: `localFilters: ProductFilterState` (적용 전 임시 상태 보유)

**Events / Callbacks**:

- `onClose()`: 닫기 버튼 또는 Backdrop 클릭 시 호출

#### 4. UI States (상태 명세)

| 상태       | 트리거 조건     | UI 표현                              |
| ---------- | --------------- | ------------------------------------ |
| **Closed** | `isOpen: false` | 화면 밖 하단 위치 (hidden)           |
| **Open**   | `isOpen: true`  | 화면 하단에서 슬라이드 업 + Backdrop |

#### 5. Functional Requirements (단계별 요구사항)

1. `isOpen: true` 시 Backdrop(`bg-black/40`)이 화면 전체를 덮으며 Drawer가 아래에서 올라온다
2. Drawer 내부는 `ProductFilterPanel`과 동일하게 `ProductSearchBar` 및 전체 필터 항목을 포함한다
3. 아래로 드래그하거나 "취소하기" 버튼을 클릭하여 Drawer를 닫는다
4. Backdrop 클릭 시 `onClose()`를 호출한다
5. 모든 필터링 조작은 `localFilters` 상태만 갱신하며, 하단 스티키 "적용하기" 버튼 클릭 시 `onChange(localFilters)` 호출 후 Drawer가 닫힌다.
6. Drawer가 열린 상태에서 body 스크롤을 잠근다 (`overflow-hidden`)

#### 6. Design Spec (디자인 명세)

- **Layout**: `fixed bottom-0 left-0 right-0`, 화면 전체 높이(`h-full`), `rounded-t-[2.5rem]`, `bg-white`
- **Drawer Interaction & Animation**:
  - Open: `y: 100% → 0`, Spring Transition (Damping: 25, Stiffness: 200)
  - Drag: 핸들바를 이용한 Y축 드래그 지원 (`drag="y"`, `dragControls` 사용)
  - Physics: `dragConstraints={{ top: 0, bottom: 0 }}`, `dragElastic={{ top: 0, bottom: 1 }}` 적용으로 1:1 추종 및 자동 복위 구현
  - Dismiss: 드래그 오프셋이 150px 초과 시 `onClose()` 트리거
- **Handle Bar**: 상단 중앙 `w-12 h-1.5 rounded-full bg-gray-200 mx-auto mt-4`, 드래그 트리거 역할
- **Layout Structure**:
  - (Fixed Top) Handle Bar 전용 드래그 영역 (`pt-4 pb-2`)
  - (Inner Scroll) 필터 콘텐츠 영역 (`flex-1 overflow-y-auto`, `px-6 pb-8`)
  - (Fixed Bottom) 적용하기 버튼 영역 (`shrink-0`, `py-5 pb-10`)
- **Responsive**: 모바일(`< 768px`) 전용 UI

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 필터 버튼 클릭 시 Drawer가 하단에서 슬라이드 업으로 열린다
- [ ] (기능) Backdrop 클릭 또는 취소 버튼 클릭 시 Drawer가 닫힌다
- [ ] (기능) Drawer 열린 상태에서 배경 스크롤이 비활성화된다
- [ ] (기능) 스티키 "적용하기" 버튼 클릭 시 필터링이 반영되고 Drawer가 닫힌다
- [ ] (인터랙션) 열기 `0.35s easeOut`, 닫기 `0.25s easeIn` 애니메이션이 동작한다
- [ ] (반응형) 데스크톱/태블릿(`≥ 768px`)에서 렌더링되지 않는다

---

### ProductCardList

#### 1. Overview (맥락)

- **목적**: 필터·검색 결과에 맞는 원두 카드 목록을 반응형 그리드로 렌더링하는 컨테이너 컴포넌트
- **위치**: `apps/web/components/products/ProductCardList.tsx`
- **부모 컴포넌트**: `products/page.tsx`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `framer-motion`, Tailwind CSS v4
- **기타 제약**: 백엔드 연동 전 Mock 데이터 사용

#### 3. Data Interface (I/O)

**Props**:

```ts
interface ProductInfo {
  id: number; // 데이터베이스 식별자 (라우팅에 직접 사용하지 않음)
  name: string; // 원두 이름 (예: "Colombia Aristides Guarnizo")
  origin: string; // 원산지 (예: "HUILA, COLOMBIA")
  primaryFlavor: FlavorType; // 대표 아로마 (배경 색상 결정에 사용)
  flavorImageUrl: string; // 대표 아로마 식재료 이미지 URL
  roasting: RoastingType; // 1~5
  body: 1 | 2 | 3 | 4 | 5;
  link: string; // 캐노니컬 상세 페이지 경로 (라우팅의 기준)
}

interface ProductCardListProps {
  products: ProductInfo[];
  isLoading: boolean;
}
```

**State**: 없음

**Events / Callbacks**: 없음

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건                | UI 표현                                        |
| ----------- | -------------------------- | ---------------------------------------------- |
| **Default** | 데이터 정상 로드           | 원두 카드 반응형 그리드                        |
| **Loading** | `isLoading: true`          | Skeleton 카드 그리드                           |
| **Empty**   | `products` 배열이 비어있음 | 빈 상태 안내 (`w-full` 유지하여 레이아웃 고정) |

#### 5. Functional Requirements (단계별 요구사항)

1. `products` 배열을 순서대로 `ProductCard`로 렌더링한다
2. `isLoading: true` 시 Skeleton 카드를 그리드 형태로 표시한다
3. `products` 배열이 비어있을 때 빈 상태 안내 문구를 중앙에 표시한다
4. 스크롤 진입 시 카드가 순차적으로 페이드인된다

#### 6. Design Spec (디자인 명세)

- **Layout**: CSS Grid, `items-start` 정렬 (요소 높이에 따른 정렬 영향 최소화)
- **Animation** (`framer-motion`):
  - 래퍼: `AnimatePresence` (데이터 변경 시 카드 추가/제거 감지)
  - 효과: 필터 변경 시 전체 리스트를 `key` 속성으로 재트리거하여 페이드 인/아웃 수행 (Sliding 배제)
  - Duration: `0.3s`, Easing: `easeOut`
- **Responsive**:
  - Mobile (`< 768px`): 2열 그리드
  - Tablet (`768px ~ 1024px`): 3열 그리드
  - Desktop (`> 1024px`): 4열 그리드

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 원두 카드 목록이 그리드로 정상 렌더링된다
- [ ] (기능) 로딩 시 Skeleton 카드가 표시된다
- [ ] (기능) 빈 결과 시 안내 문구가 중앙에 표시된다
- [ ] (인터랙션) 스크롤 진입 시 카드가 순차 페이드인된다
- [ ] (반응형) Mobile 2열 / Tablet 3열 / Desktop 4열 그리드가 동작한다

---

### ProductCard

#### 1. Overview (맥락)

- **목적**: 단일 원두를 아로마 대표 식재료 풀-사이즈 사진과 텍스트 오버레이로 표현하는 프리미엄 카드 컴포넌트. 정보 탐색적 성격보다 시각적 감성(Look & Feel)을 극대화합니다.
- **위치**: `apps/web/components/common/cards/ProductCard.tsx`
- **부모 컴포넌트**: `ProductCardList`, `RecommendedProducts`
- **레퍼런스 디자인**: 제공된 "Sunrise Vegan Bowl" 예시와 동일한 이미지 중심 레이아웃

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `next/image`, `next/link`, `framer-motion`, Tailwind CSS v4, `ui-library` (`VisualCard`, `RatingScale`)
- **스타일링 규칙**: `VisualCard` 패턴 준수, `object-cover`를 사용하여 카드 전체 영역을 채움.
- **가독성 규칙**: 이미지와 텍스트 사이의 대비를 위해 `VisualCard.Overlay` 필수 적용.

#### 3. Data Interface (I/O)

```ts
interface ProductCardProps {
  id: number; // 식별용
  name: string;
  origin: string;
  primaryFlavor: FlavorType;
  flavorImageUrl: string;
  link: string; // 상세 페이지로 이동할 캐노니컬 URL
  balance: number; // 1~5
  sweetness: number; // 1~5
  acidity: number; // 1~5
  roasting: 1 | 2 | 3 | 4 | 5;
  body: 1 | 2 | 3 | 4 | 5;
  index?: number;
}
```

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건 | UI 표현                                                                 |
| ----------- | ----------- | ----------------------------------------------------------------------- |
| **Default** | 초기 렌더링 | 풀-사이즈 배경 이미지 + 하단 그라데이션 + 화이트 텍스트                 |
| **Hover**   | 마우스 오버 | 카드 부유(`y: -6px`) + 배경 이미지 확대 + **향미 프로필 오버레이** 노출 |

#### 5. Functional Requirements (단계별 요구사항)

1. `flavorImageUrl`을 카드 전체 배경으로 사용한다 (`fill`, `object-cover`)
2. 하단 60% 영역에 선형 그라데이션(`black/90` → `transparent`)을 적용하여 텍스트 가독성을 확보한다
3. 텍스트는 좌측 하단에 정렬하며, 원산지 → 원두명 순서로 배치한다
4. 호버 시 카드가 위로 떠오르며 배경 이미지가 확대되는 동시에 **커피 프로필(Acidity, Sweetness, Balance, Body, Roasting) 정보가 60% 투명도의 블랙 오버레이와 Backdrop Blur(`2px`) 효과와 함께 나타난다.**
5. 오버레이 내부 상단에는 **로스터리 마크(Coffee 아이콘)**가 표시된다.

6. 클릭 시 `link` 프로퍼티의 경로로 라우팅한다. 상세 명세는 [원두 상세 페이지 명세서(product-detail-page.md)](product-detail-page.md)를 참조하십시오. (id는 데이터베이스 식별용으로만 관리하며 라우팅은 link를 따름)

#### 6. Design Spec (디자인 명세)

- **Layout**: `VisualCard` 기반 `aspect-[3/4]`, `rounded-2xl`, `overflow-hidden`, `relative`
- **Overlay**: `VisualCard.Overlay` (기본), 호버 시 `black/60` 블랙 오버레이 + Backdrop Blur(`2px`)
- **Animation** (`framer-motion`):
  - 마운트: `VisualCard.Root`의 초기 애니메이션 준수
  - 호버: `VisualCard.Root` (y: -6px), `VisualCard.Image` (scale-110)
- **Typography**:
  - 원산지(Origin): `font-outfit`, `text-[10px]`, `text-white/70`, `uppercase`, `tracking-[0.2em]`
  - 원두명(Name): `font-playfair`, `text-2xl`, `text-white`, `font-bold`, `leading-tight`

#### 7. Definition of Done (검증 기준)

- [ ] (디자인) 이미지가 카드 전체를 가득 채우고 잘림 현상이 자연스럽다
- [ ] (디자인) 하단 텍스트가 어떤 배경 이미지 위에서도 명확히 읽힌다
- [ ] (인터랙션) 호버 시 이미지 확대와 카드 부유 효과가 동시에 조화롭게 일어난다
- [ ] (반응형) 그리드 내에서 카드의 세로 비율(`3:4`)이 깨지지 않는다

---

## 5. 아키텍처 요약

```text
products/page.tsx (메인 엔트리)
  ├── ProductFilterPanel       ← 필터 사이드바 (Desktop/Tablet)
  │     └── ProductSearchBar   ← 통합 검색창
  ├── ProductFilterDrawer      ← 필터 Drawer (Mobile)
  │     └── ProductSearchBar   ← 통합 검색창
  └── ProductCardList
        └── ProductCard × N
```

**상태 관리**: `products/page.tsx`에서 `filterState`와 `searchQuery`를 관리하고 하위 컴포넌트에 Props로 전달합니다.

```ts
// page.tsx 상태 구조
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState<ProductFilterState>(defaultFilters);
const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

// 필터된 원두 목록 = useMemo(() => applyFilters(products, filters, searchQuery), [...])
```

---

## 6. 핵심 동작 요구사항

- **텍스트 최소화**: 카드 내 키워드(원산지, 원두명)만 노출하며 설명 문구 배제
- **아로마 색상 시스템**: `FlavorColor Palette` 토큰으로 카드 배경 색상을 일관성 있게 관리
- **명시적 지연 반영(Deferred)**: 필터 상태는 즉시 반영되지 않고 '적용하기' 버튼에 의해 제출되어야 한다
- **모바일 Drawer**: 모바일에서 필터가 Drawer로 동작하여 탐색 공간을 최대화
- **API 연동**: 백엔드의 `/api/products/search` 엔드포인트를 통해 데이터를 페칭하며, 이미지 부재 시 향미 이미지(`flavorImageUrl`)를 우선 노출하는 Fallback 로직 적용

---

## 8. API 연동 명세 (초안)

### 상황

> 상품(원두) 목록 조회 (필터·검색 및 페이지네이션 포함)

### Request

```http
GET /api/products/search?keyword={keyword}&flavorCategory={category}&minAcidity={1-10}&maxAcidity={1-10}&minSweetness={1-10}&maxSweetness={1-10}&body={1-5}&page={0}&size={12}
```

| Query Parameter  | Type     | Description                            | 필수 |
| ---------------- | -------- | -------------------------------------- | ---- |
| `keyword`        | `string` | 원두명 / 생산지 / 로스터명 키워드 검색 | ✗    |
| `flavorCategory` | `string` | 맛 카테고리 (FRUITY, NUTTY 등 Enum)    | ✗    |
| `minAcidity`     | `number` | 산미 최소값 (1~10)                     | ✗    |
| `maxAcidity`     | `number` | 산미 최대값 (1~10)                     | ✗    |
| `minSweetness`   | `number` | 단맛 최소값 (1~10)                     | ✗    |
| `maxSweetness`   | `number` | 단맛 최대값 (1~10)                     | ✗    |
| `body`           | `number` | 바디감 1~5                             | ✗    |
| `page`           | `number` | 페이지 번호 (0부터 시작)               | ✗    |
| `size`           | `number` | 한 페이지 당 아이템 수 (기본 12)       | ✗    |

### Response Body

```ts
interface ProductSearchResponse {
  statusCode: string;
  message: string;
  data: {
    content: ProductSearchItem[]; // 향미/이미지 정보 포함 상품 리스트
    totalPages: number;
    totalElements: number;
    currentPage: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```
