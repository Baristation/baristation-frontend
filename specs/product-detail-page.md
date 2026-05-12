# 원두 상세 페이지 명세서 (Product Detail Page) - Baristation

## 1. 페이지 개요

특정 원두의 모든 감각적 정보를 제공하는 상세 탐색 페이지입니다. 사용자가 원두의 개성을 깊이 있게 이해하는 것을 목표로 합니다.

**핵심 설계 원칙**: "Laboratory Aesthetics" - 정제된 데이터(지표)와 감성적인 비주얼(이미지)의 조화를 통해 연구소에서 원두를 분석한 듯한 느낌을 전달합니다.

---

## 2. 디자인 시스템 참조

모든 디자인 토큰(Color, Typography, Motion)은 [공통 UI 명세서(common-ui-spec.md)](common-ui-spec.md)를 기반으로 합니다.

**페이지 무드: "Analytical Elegance"** — 깔끔한 타이포그래피와 정렬된 데이터 그리드를 통해 신뢰감을 주고, 고해상도 아로마 이미지를 통해 감각적인 자극을 병행합니다.

---

## 3. 페이지 레이아웃 구조

```text
[Desktop (≥1024px)]
┌─────────────────────────────────────────┐
│  GlobalNav                              │
│─────────────────────────────────────────│
│  ┌───────────────────┐ ┌──────────────┐ │
│  │                   │ │ Header Info  │ │
│  │ [Hero Image]      │ │ ├─ Name      │ │
│  │ (1:1 Aspect)      │ │ ├─ Icons     │ │
│  │                   │ │ └─ [Purchase]│ │
│  │                   │ │              │ │
│  │                   │ │              │ │
│  └───────────────────┘ └──────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ [Product Info Section]                │ │
│  │ ├─ Description (Full Width)        │ │
│  │ └─ Info Grid (2x3 Grid on Desktop) │ │
│  │────────────────────────────────────│ │
│  │ [Flavor Profile]                   │ │
│  │────────────────────────────────────│ │
│  │ [Recommended Products]                │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**레이아웃 제약 사항**:

- 전체 래퍼는 `@/components/layout/PageContainer`를 적용하여 `Bottom Navigation`과 `Global Header`와의 간섭을 회피합니다.
- 각 개별 섹션(Hero, Profile 등)은 `SectionContainer` 컴포넌트로 래핑하여 `px-8`의 공통 수평 여백과 `max-w-7xl` 중앙 정렬을 보장합니다.
- **수직 간격(Spacing)**: 모바일에서의 정보 밀도를 위해 섹션 간 패딩을 축소(`py-6~12`)하며, 데스크톱에서는 여유로운 공간감(`py-8~20`)을 유지합니다.
- **풀 블리드(Full-bleed)**: `SectionContainer`를 통해 배경색이 화면 끝까지 차오르는 디자인을 지원합니다.

---

## 4. 컴포넌트 명세 (Component Specs)

### ProductDetailHero

#### 1. Overview (맥락)

- **목적**: 원두의 첫인상을 결정하는 히어로 영역. 대표 이미지와 핵심 기본 정보, 북마크, 구매처 연결 기능을 제공함.
- **위치**: `apps/web/app/(main)/products/[id]/_components/ProductDetailHero.tsx`
- **부모 컴포넌트**: `ProductDetailPage`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `next/image`, `lucide-react` (`Bookmark`, `Share`, `ChevronLeft`, `ExternalLink`), `framer-motion`
- **스타일링 규칙**: Tailwind CSS v4를 활용하며 `VisualCard` 패턴과 유사한 감성을 유지함.

#### 3. Data Interface (I/O)

**Props**:

```ts
interface ProductDetailHeroProps {
  name: string; // 원두명
  origin: string; // 원산지
  roastery?: string; // 로스터리
  flavorImageUrl: string; // 아로마 이미지 URL
  primaryFlavor: FlavorType; // 대표 아로마
  purchaseUrl?: string; // 구매 외부 링크 (미존재 시에도 버튼은 유지)
}
```

**State**:

| 상태명         | 타입      | 초기값  | 설명                         |
| -------------- | --------- | ------- | ---------------------------- |
| `isBookmarked` | `boolean` | `false` | 유저의 현재 북마크 토글 여부 |

#### 4. UI States (상태 명세)

| 상태            | 트리거 조건      | UI 표현                                                                              |
| --------------- | ---------------- | ------------------------------------------------------------------------------------ |
| **Default**     | 초기 렌더링      | 이미지(좌) + 정보(우) 배치 (Desktop 기준)                                            |
| **Bookmarked**  | 북마크 버튼 클릭 | 아이콘 채도 활성화 및 `Gray-700` 색상 적용                                           |
| **Purchasable** | 상시 노출        | 헤더 액션 바에 `ExternalLink` 아이콘을 포함한 '구매하기' 버튼(검은색 배경) 상시 노출 |

#### 5. Functional Requirements (단계별 요구사항)

1. **모바일 전용 헤더 및 액션**:
   - 모바일 해상도에서 "Baristation" 로고를 좌측에, 북마크/공유 버튼을 우측 상단에 배치한다.
   - 상단 버튼은 `bg-white/90` 및 `backdrop-blur`를 적용하여 배경에 상관없이 시인성을 확보한다.
   - **'구매하기' 버튼은 모바일에서 우측 하단 플로팅 버튼(FAB)** 형태로 제공하여 접근성을 높인다.
2. 원두의 대표 아로마 이미지를 고해상도(1:1 비율)로 렌더링하며, 모든 해상도에서 수평 중앙 정렬을 유지한다.
3. 로스터리 명과 원두명을 명확한 위계(`Playfair Display`)로 표시한다.
4. 데스크톱 기준, 북마크 및 공유 버튼은 우측 정렬하되 '구매하기' 버튼은 해당 영역의 좌측에 배치한다.
5. 상단에 "Back" 버튼을 두어 브라우저 History 상 이전 라우트로 이동 가능케 하며, 헤더와의 간격을 최소화(`mt-0 md:mt-4`)한다.
6. 모바일 해상도에서 이미지와 텍스트 오버레이 사이의 간격을 최적화한다.

#### 6. Definition of Done (검증 기준)

- [ ] (기능) 구매용 `purchaseUrl`이 없는 경우에도 버튼은 노출되어야 하며, 클릭 시 '준비 중' 피드백을 제공한다.
- [ ] (디자인) 외부 링크 버튼은 사용자에게 다른 앱 영역으로 이동함을 아이콘 등으로 충분히 인지시켜야 한다.

---

### ProductInfoTable

#### 1. Overview (맥락)

- **목적**: 원두의 기원, 카테고리, 블렌딩 여부, 가공 방식, 재배 높이 및 상세 이야기를 담은 첫 진입 정보 패널.
- **위치**: `apps/web/app/(main)/products/[id]/_components/ProductInfoTable.tsx`
- **부모 컴포넌트**: `ProductDetailPage`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **스타일링 규칙**: 컨테이너의 가독성을 위해 흰색이 아닌 약간의 대비를 갖는 `Secondary-Surface` 계통(또는 `bg-gray-50`)의 박스를 사용.

#### 3. Data Interface (I/O)

**Props**:

```ts
interface ProductInfoTableProps {
  origin: string; // 원산지
  category?: string; // 카테고리 (예: 'Single Origin', 'Decaf')
  blend?: boolean; // 블렌드여부 (혼합 여부)
  processing?: string; // 가공방식
  variety?: string; // 품종
  altitude?: string; // 재배고도
  description?: string; // 상세설명
}
```

#### 4. UI States (상태 명세)

| 상태            | 트리거 조건                                     | UI 표현                               |
| --------------- | ----------------------------------------------- | ------------------------------------- |
| **Default**     | 입력된 정보(Value)가 존재하는 항목              | 정상 리스트(`li`) 컴포넌트 렌더링     |
| **Empty Value** | 특정 속성(예: processing)이 Null이거나 비어있음 | 해당 속성을 렌더링하지 않고 필터링 함 |

#### 5. Functional Requirements (단계별 요구사항)

1. "원두 정보" 섹션 상단에 상세 설명을 배치하여 원두의 스토리를 전달한다. (최대 너비 제한으로 가독성 확보)
2. 하단에 원산지, 분류, 가공 방식 등의 정보 항목을 **2행 3열 그리드(데스크톱/태블릿 기준)**로 렌더링한다. 모바일에서는 1열로 쌓는다.
3. `blend`가 true면 '블렌드', false면 '싱글 오리진'을 표시한다.
4. 내용이 없는 데이터(Undefined, Null)는 테이블 리스트에서 동적으로 제거한다.

#### 6. Definition of Done (검증 기준)

- [ ] (기능) 데이터가 없는(`undefined`) Prop 필드는 화면 상 목록 구조에서 나타나지 않는다.
- [ ] (기능) `blend` prop 유무에 따라 카테고리가 Single Origin 인지 Blend 인지 정확히 표기된다.

---

### FlavorProfileSection

#### 1. Overview (맥락)

- **목적**: 원두의 감각적 특성을 정량적 지표로 시각화하여 사용자가 직관적으로 맛의 프로파일을 유추할 수 있도록 함.
- **위치**: `apps/web/app/(main)/products/[id]/_components/FlavorProfileSection.tsx`
- **부모 컴포넌트**: `ProductDetailPage`

#### 2. Data Interface (I/O)

**Props**:

```ts
interface FlavorProfileProps {
  acidity: number; // 산미 (1~5)
  sweetness: number; // 감미 (1~5)
  balance: number; // 밸런스 (1~5)
  body: number; // 바디감 (1~5)
  roasting: number; // 로스팅 (1~5)
}
```

#### 3. Functional Requirements (단계별 요구사항)

1. 모든 지표는 `RatingScale` 컴포넌트를 사용하여 **5단계 표준 척도**로 표시한다.
2. 지표 배치 순서는 **산미(Acidity) -> 감미(Sweetness) -> 바디감(Body)** (상단 그리드), **밸런스(Balance) -> 로스팅(Roast)** (하단 그리드) 순으로 정렬한다.
3. 로스팅 단계는 5단계를 지원하며, 툴팁이나 가이드 상에서 **Light, Light Medium, Medium, Medium Dark, Dark**로 구분한다.

---

---

## 5. 아키텍처 요약

```text
products/[id]/page.tsx (Detail Entry)  [ 래퍼 : <PageContainer> ]
  ├── ProductDetailHero        ← 상단 비주얼, 북마크, 구매 연결(ExternalLink)
  ├── ProductInfoTable         ← 설명 서술 및 기본 정보 제공(카테고리 등)
  ├── FlavorProfileSection  ← 맛 정보 분석 지표(차트화)
  └── RecommendedProducts      ← 페이지 하단의 "비슷한 맛의 원두 추천" 영역
```

---
