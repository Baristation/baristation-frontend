# 메인 페이지 명세서 (Main Page / Landing) - Baristation

## 1. 페이지 개요

Baristation 서비스의 메인 진입점(Landing Page)이자 메인 페이지(Main Page) 역할을 동시에 수행합니다. 사용자에게 직관적이고 시각적인 커피 경험을 제안하고, 추천 원두와 로스터리 위치 등 핵심 서비스로 빠르게 유도합니다.

---

## 2. 디자인 시스템 참조

모든 디자인 토큰(Color, Typography, Motion)과 브랜드 아이덴티티 원칙은 [공통 UI 명세서(common-ui-spec.md)](common-ui-spec.md)를 기반으로 합니다.

**메인 무드: "Visual-First Landing"** — 공통 명세의 `Internal Coffee Lab` 무드를 적극 활용하여, 텍스트 설명 대신 고해상도 이미지와 공백(White Space)으로 브랜드 가치를 전달합니다. (상세 설명은 최대 한 문장 이내로 제한)

---

## 3. 컴포넌트 명세 (Component Specs)

---

### Header

#### 1. Overview (맥락)

- **목적**: 모든 페이지에서 일관된 글로벌 네비게이션을 제공하며, 스크롤에 따라 배경이 변화하고 인증 상태에 따라 우측 아이콘이 동적으로 전환되는 최상단 헤더
- **위치**: `apps/web/components/layout/Header.tsx`
- **부모 컴포넌트**: `RootLayout`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `next/link`, Tailwind CSS v4, `framer-motion`, `lucide-react`
- **스타일링 규칙**: Tailwind CSS v4만 사용, glassmorphism 효과는 `backdrop-blur` 활용
- **기타 제약**: `useAuth` 커스텀 훅을 통해 서버 세션(BFF 쿠키) 및 인증 상태를 관리함

#### 3. Data Interface (I/O)

**Props**: 없음 (전역 상태 직접 참조)

**State**:
| 상태명 | 타입 | 초기값 | 설명 |
|--------|------|--------|------|
| `isScrolled` | `boolean` | `false` | 스크롤 여부에 따른 배경 전환 트리거 |
| `isAuthenticated` | `boolean` | `false` | `useAuth` 훅을 통해 제공되는 인증 여부 |

**Events / Callbacks**: 없음

#### 4. UI States (상태 명세)

| 상태                | 트리거 조건   | UI 표현                                             |
| ------------------- | ------------- | --------------------------------------------------- |
| **Default (top)**   | 스크롤 최상단 | 배경 완전 투명                                      |
| **Scrolled**        | 스크롤 발생   | 반투명 Glassmorphism (`backdrop-blur`, 배경색 노출) |
| **Unauthenticated** | 세션 없음     | 우측 User 아이콘 (→ `/login`)                       |
| **Authenticated**   | 세션 있음     | 우측 LogOut 아이콘 (→ `logout()` 실행)              |

#### 5. Functional Requirements (단계별 요구사항)

1. 페이지 최상단에서 배경을 완전 투명으로 유지하다가, 스크롤 발생 시 반투명 Glassmorphism 효과를 적용한다
2. 좌측에 `Playfair Display` 폰트의 **"Baristation"** 로고를 배치한다
3. 중앙/우측에 Home, Product Info, Classes 메뉴를 제공한다
4. 우측 끝 북마크 아이콘으로 저장 목록 페이지로 이동한다
5. `useAuth` 훅의 `isAuthenticated` 상태를 감지하여 User / LogOut 아이콘을 동적으로 전환한다
6. LogOut 아이콘 클릭 시 `logout()` 함수를 실행하여 BFF 세션을 종료한다

#### 6. Design Spec (디자인 명세)

- **Layout**: `position: fixed`, `top: 0`, `width: 100%`, `z-index: 50`, Flex Row (logo left / menu right)
- **Animation** (`framer-motion`):
  - 트리거: `isScrolled` 상태 변화
  - 효과: 배경 opacity `0 → 0.9`, `backdrop-blur-sm` 적용
  - Duration: `0.3s`, Easing: `ease-out`
- **Responsive**:
  - Mobile (`< 768px`): 햄버거 메뉴 또는 아이콘만 표시
  - Desktop (`> 768px`): 전체 메뉴 노출

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 스크롤 전 배경이 완전 투명이고, 스크롤 후 Glassmorphism 효과가 적용된다
- [ ] (기능) 미인증 상태에서 User 아이콘이 노출되고 클릭 시 `/login`으로 이동한다
- [ ] (기능) 인증 상태에서 LogOut 아이콘이 노출되고 클릭 시 로그아웃 처리가 수행된다
- [ ] (인터랙션) 배경 전환이 `0.3s ease-out`으로 부드럽게 동작한다
- [ ] (디자인) 로고가 `Playfair Display` 폰트로 렌더링된다

---

### HeroSection

#### 1. Overview (맥락)

- **목적**: GNB 바로 아래 위치하는 대형 이미지 캐러셀과 개인화 인사말/CTA 버튼이 겹쳐진 히어로 영역
- **위치**: `apps/web/components/main/HeroSection.tsx`
- **부모 컴포넌트**: `page.tsx` (메인 엔트리)

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `embla-carousel-react`, `framer-motion`, Tailwind CSS v4
- **기타 제약**: Client Component 필수 (`embla-carousel` 훅 사용)

#### 3. Data Interface (I/O)

**Props**:

```ts
// 캐러셀 슬라이드 단위 타입 (HeroSection.tsx에서 export)
interface CarouselSlide {
  id: number;
  imageUrl: string;
  alt: string;
}

interface HeroSectionProps {
  carouselImages?: CarouselSlide[]; // 미제공 시 DEFAULT_SLIDES 사용
}
```

**State**:
| 상태명 | 타입 | 초기값 | 설명 |
|--------|------|--------|------|
| `currentSlide` | `number` | `0` | 현재 활성화된 캐러셀 슬라이드 인덱스 |

**Events / Callbacks**: 없음

#### 4. UI States (상태 명세)

| 상태           | 트리거 조건                        | UI 표현                                      |
| -------------- | ---------------------------------- | -------------------------------------------- |
| **Default**    | 초기 렌더링                        | 첫 번째 이미지 표시 + 히어로 텍스트 오버레이 |
| **Loading**    | 이미지 로딩 중                     | 다크 플레이스홀더 (`#1A1614`)                |
| **Slide 전환** | 자동 슬라이드 또는 사용자 스와이프 | 다음 이미지로 부드럽게 전환                  |

#### 5. Functional Requirements (단계별 요구사항)

1. `embla-carousel-react`로 자동 슬라이드 대형 이미지 캐러셀을 구현한다
2. 캐러셀 위에 개인화 인사말("안녕하세요, [이름]님. 오늘은 어떤 한 잔을 내려볼까요?")을 오버레이한다
3. CTA 버튼 **"원두 탐색"**(원두 추천 서비스)과 **"근처 클래스"**(클래스 정보)를 제공한다
4. 터치/스와이프를 통한 수동 슬라이드 전환을 지원한다

#### 6. Design Spec (디자인 명세)

- **Layout**: `width: 100%`, `height: 100vh` (또는 80vh), 이미지 위에 텍스트 오버레이(`z-index` 상위)
- **Animation** (`framer-motion`):
  - 히어로 텍스트: 마운트 시 `y: 20 → 0`, `opacity: 0 → 1`, Duration `0.4s`, Easing `ease-out`
  - 슬라이드 전환: `embla` 내장 전환 효과
- **Responsive**:
  - Mobile (`< 768px`): 히어로 텍스트 크기 축소, CTA 버튼 세로 정렬
  - Desktop (`> 768px`): 텍스트 좌측 정렬, CTA 버튼 가로 정렬

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 이미지 캐러셀이 자동 슬라이드와 스와이프 전환을 지원한다
- [ ] (기능) 캐러셀 위에 개인화 인사말이 오버레이되어 표시된다
- [ ] (기능) "원두 탐색" / "근처 클래스" CTA 버튼이 각 서비스로 라우팅된다
- [ ] (인터랙션) 히어로 텍스트가 마운트 시 `0.4s ease-out` 페이드인된다
- [ ] (반응형) 모바일/데스크톱에서 레이아웃이 명세에 따라 전환된다

---

### FlavorNotes

#### 1. Overview (맥락)

- **목적**: 향미 카테고리별 이미지 카드를 격자 형태로 배열하여 사용자가 시각적으로 원두 취향을 탐색하도록 유도하는 섹션
- **위치**: `apps/web/components/main/FlavorNotes.tsx`
- **부모 컴포넌트**: `page.tsx` (메인 엔트리)

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `framer-motion`, Tailwind CSS v4
- **기타 제약**: Client Component 필수 (`framer-motion` Hover 인터랙션)

#### 3. Data Interface (I/O)

**Props**:

```ts
interface TastingItem {
  tasting_name: string; // 향미 이름 (예: "카카오", "자몽")
  tasting_image_link: string; // Unsplash 원본 이미지 URL
  tasting_link: string; // 해당 향미로 필터링된 원두 목록 URL
}

interface FlavorNotesProps {
  tastings: TastingItem[]; // 향미 목록 (총 8종)
}
```

**State**: 없음

**Events / Callbacks**: 없음

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건                | UI 표현                 |
| ----------- | -------------------------- | ----------------------- |
| **Default** | 초기 렌더링                | 8종 향미 카드 격자 배열 |
| **Empty**   | `tastings` 배열이 비어있음 | 빈 상태 안내 문구       |
| **Loading** | 데이터 페칭 중             | Skeleton 카드 격자      |

#### 5. Functional Requirements (단계별 요구사항)

1. 8종의 향미(카카오, 복숭아, 아몬드, 자몽, 캐러멜, 스모키 등) 카드를 격자 레이아웃으로 배열한다
2. 각 `FlavorCard`에 `name`, `imageUrl`, `link`를 전달한다
3. 스크롤 진입 시 카드가 순차적으로 페이드인된다

#### 6. Design Spec (디자인 명세)

- **Layout**: CSS Grid
- **Animation** (`framer-motion`):
  - 트리거: 스크롤 뷰포트 진입 (`whileInView`)
  - 효과: `y: 20 → 0`, `opacity: 0 → 1` 카드별 순차 딜레이
  - Duration: `0.3s`, Easing: `ease-out`
- **Responsive**:
  - Mobile (`< 768px`): 2열 그리드
  - Tablet (`768px ~ 1024px`): 3열 그리드
  - Desktop (`> 1024px`): 4열 그리드

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 8종의 향미 카드가 정상 렌더링된다
- [ ] (기능) 빈 데이터 시 빈 상태 안내가 표시된다
- [ ] (인터랙션) 스크롤 진입 시 카드가 순차 페이드인된다
- [ ] (반응형) 모바일 2열 / 태블릿 3열 / 데스크톱 4열 그리드가 정상 동작한다

---

### FlavorCard

#### 1. Overview (맥락)

- **목적**: 단일 향미 카테고리를 정사각형 이미지 카드로 표현하며, 클릭 시 해당 향미 원두 목록으로 라우팅하는 인터랙티브 카드 컴포넌트
- **위치**: `apps/web/components/common/cards/FlavorCard.tsx`
- **부모 컴포넌트**: `FlavorNotes`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `next/image`, `next/link`, `framer-motion`, Tailwind CSS v4
- **스타일링 규칙**: `overflow-hidden` 처리 필수 (호버 이미지 확대 시 카드 밖으로 넘침 방지)

#### 3. Data Interface (I/O)

**Props**:

```ts
interface FlavorCardProps {
  name: string; // 향미 이름
  imageUrl: string; // 배경 이미지 URL
  link: string; // 클릭 시 라우팅 경로
}
```

**State**: 없음 (호버 상태는 `framer-motion` whileHover로 처리)

**Events / Callbacks**: 없음 (`next/link`로 직접 라우팅)

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건 | UI 표현                                        |
| ----------- | ----------- | ---------------------------------------------- |
| **Default** | 초기 렌더링 | 정사각형 이미지 카드 + 좌하단 향미 이름 텍스트 |
| **Hover**   | 마우스 오버 | 내부 이미지만 `scale: 1.1`로 부드럽게 확대     |

#### 5. Functional Requirements (단계별 요구사항)

1. `Aspect Ratio 1:1` 정사각형 카드를 구성한다
2. `tasting_image_link` 이미지를 `object-cover`로 카드 전체를 채운다
3. 카드 좌측 최하단에 `tasting_name`을 텍스트 레이어로 표시한다
4. 텍스트 가독성을 위해 카드 하단에 `linear-gradient` (Transparent → Black/40%) 스크림 오버레이를 적용한다
5. 호버 시 **컨테이너는 고정**하고 **내부 이미지만** `scale: 1.1`로 확대한다
6. 클릭 시 `tasting_link`로 라우팅한다

#### 6. Design Spec (디자인 명세)

- **Layout**: `aspect-ratio: 1/1`, `rounded-xl` (약 12px), `overflow-hidden`
- **Animation** (`framer-motion`):
  - 트리거: 마우스 호버 (`whileHover`)
  - 대상: 이미지 요소만 (`scale: 1.0 → 1.1`)
  - Duration: `0.3s`, Easing: `easeOut`
- **Typography**: 향미 이름 — `Outfit`, Bold, `Brand-Cream` 또는 White
- **Responsive**: 부모 `FlavorNotes`의 그리드 열 수에 따라 크기 자동 조절

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 카드가 1:1 비율을 유지하며 렌더링된다
- [ ] (기능) 클릭 시 `link`로 라우팅된다
- [ ] (디자인) 카드 하단에 그라데이션 스크림 오버레이가 적용된다
- [ ] (디자인) 텍스트가 `Outfit` Bold, `Brand-Cream` 색상으로 좌하단에 위치한다
- [ ] (인터랙션) 호버 시 컨테이너 크기는 유지되고 내부 이미지만 `scale: 1.1`, `0.3s easeOut`으로 확대된다

---

### RecommendedProducts

#### 1. Overview (맥락)

- **목적**: API에서 받아온 큐레이션 추천 원두 목록을 카드 형태로 나열하는 섹션
- **위치**: `apps/web/components/main/RecommendedProducts.tsx`
- **부모 컴포넌트**: `page.tsx` (메인 엔트리)

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `framer-motion`, Tailwind CSS v4
- **기타 제약**: Client Component 필수, `getMainDataAction`을 통해 추천 상품 데이터를 페칭함

#### 3. Data Interface (I/O)

**Props**:

```ts
interface ProductItem
  extends Pick<
    ProductInfo,
    | 'name'
    | 'origin'
    | 'primaryFlavor'
    | 'flavorImageUrl'
    | 'link'
    | 'balance'
    | 'sweetness'
    | 'acidity'
    | 'body'
    | 'roasting'
    | 'purchaseUrl'
  > {}

interface RecommendedProductsProps {
  products: ProductItem[];
}
```

**State**: 없음

**Events / Callbacks**: 없음

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건                | UI 표현            |
| ----------- | -------------------------- | ------------------ |
| **Default** | 데이터 정상 로드           | 원두 카드 목록     |
| **Loading** | 데이터 페칭 중             | Skeleton 카드 목록 |
| **Empty**   | `products` 배열이 비어있음 | 빈 상태 안내 문구  |

#### 5. Functional Requirements (단계별 요구사항)

1. `products` 배열을 순서대로 `ProductCard`로 렌더링한다
2. 스크롤 진입 시 카드가 순차적으로 페이드인된다
3. 데이터 페칭 결과에 따라 유동적으로 상품 리스트를 렌더링한다

#### 6. Design Spec (디자인 명세)

- **Layout**: 가로 스크롤 또는 그리드 레이아웃 (구현 시 결정)
- **Animation** (`framer-motion`):
  - 트리거: 스크롤 뷰포트 진입 (`whileInView`)
  - 효과: `y: 20 → 0`, `opacity: 0 → 1`, 카드별 순차 딜레이
  - Duration: `0.3s`, Easing: `ease-out`
- **Responsive**:
  - Mobile (< 768px): **2x2 그리드 (총 4개 노출)** - `grid-cols-2`
  - Tablet (768px-1024px): 3개 노출 - `md:grid-cols-3`
  - Desktop (> 1024px): 4개 노출 - `lg:grid-cols-4`

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 원두 카드 목록이 정상 렌더링된다
- [ ] (기능) 빈 데이터 시 빈 상태 안내가 표시된다
- [ ] (기능) `getMainDataAction` 연동을 통해 실제 백엔드 데이터로 정상 동작한다
- [ ] (인터랙션) 스크롤 진입 시 카드가 순차 페이드인된다

---

### ProductCard

- **명세**: [원두 정보 페이지 명세서(products-page.md) - ProductCard](products-page.md#productcard) 항목을 참조하십시오.
- **위치**: `apps/web/components/common/cards/ProductCard.tsx`
- **특이사항**: 메인 페이지에서는 `RecommendedProducts` 그리드 내에서 동일한 컴포넌트를 사용하며, 모든 인터랙션(프로필 오버레이 등)이 동일하게 지원됩니다.

---

### RoasteryMapSection

#### 1. Overview (맥락)

- **목적**: 현재 사용자의 위치 기반으로 주변 로스터리 카페의 위치 정보를 카카오 지도로 표시하는 섹션
- **위치**: `apps/web/components/main/RoasteryMapSection.tsx`
- **부모 컴포넌트**: `page.tsx` (메인 엔트리)

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `react-kakao-maps-sdk` (`useKakaoLoader` 훅), Tailwind CSS v4
- **기타 제약**: Client Component 필수, 브라우저 Geolocation API 필요

#### 3. Data Interface (I/O)

**Props**: 없음 (내부에서 Geolocation API로 위치 조회)

**State**:
| 상태명 | 타입 | 초기값 | 설명 |
|--------|------|--------|------|
| `userPosition` | `{ lat: number; lng: number } \| null` | `null` | 사용자 현재 위치 좌표 |
| `mapCenter` | `{ lat: number; lng: number }` | 서울 기본값 | 지도 중심 좌표 |

**Events / Callbacks**: 없음

#### 4. UI States (상태 명세)

| 상태                  | 트리거 조건                            | UI 표현                          |
| --------------------- | -------------------------------------- | -------------------------------- |
| **Loading**           | 카카오 지도 SDK 로딩 중 / 위치 조회 중 | 로딩 스피너 또는 플레이스홀더    |
| **Default**           | 위치 조회 성공 + SDK 로드 완료         | 카카오 지도 + 주변 로스터리 마커 |
| **Permission Denied** | 위치 권한 거부                         | 기본 도시(서울) 중심 지도 표시   |
| **Empty**             | 주변 로스터리 없음                     | 지도 표시 + 안내 문구            |
| **Error**             | SDK 로드 실패                          | 에러 메시지                      |

#### 5. Functional Requirements (단계별 요구사항)

1. `useKakaoLoader` 훅으로 카카오 지도 SDK를 비동기 로드한다
2. 브라우저 Geolocation API로 사용자 현재 위치를 조회한다
3. 지도 위에 주변 로스터리 카페의 위치 마커를 렌더링한다
4. 위치 권한을 거부한 경우 서울 기본 좌표로 폴백한다

#### 6. Design Spec (디자인 명세)

- **Layout**: 섹션 내 지도를 우측에 배치, 좌측에 로스터리 목록 (또는 전체 너비 지도)
- **Animation**: 없음 (지도 SDK 자체 애니메이션 활용)
- **Responsive**:
  - Mobile (`< 768px`): 지도 전체 너비, 세로 스택
  - Desktop (`> 768px`): 지도 / 목록 좌우 분할

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 카카오 지도가 정상 렌더링된다
- [ ] (기능) 사용자 위치 기반으로 지도 중심이 설정된다
- [ ] (상태) 위치 권한 거부 시 서울 기본 좌표로 폴백된다
- [ ] (상태) SDK 로딩 중 로딩 플레이스홀더가 표시된다
- [ ] (반응형) 모바일/데스크톱에서 레이아웃이 명세에 따라 전환된다

---

### Footer

#### 1. Overview (맥락)

- **목적**: 서비스 최하단에 브랜드 카피라이트를 표시하는 심플한 전역 푸터
- **위치**: `apps/web/components/layout/Footer.tsx`
- **부모 컴포넌트**: `RootLayout`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: Tailwind CSS v4
- **스타일링 규칙**: 담백한 라이트 테마 구성, Uppercase/넓은 자간 과도한 디자인 요소 배제

#### 3. Data Interface (I/O)

**Props**: 없음 (정적 콘텐츠)

**State**: 없음

**Events / Callbacks**: 없음

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건 | UI 표현                             |
| ----------- | ----------- | ----------------------------------- |
| **Default** | 초기 렌더링 | 로고(좌) + 카피라이트(우) 정적 표시 |

#### 5. Functional Requirements (단계별 요구사항)

1. `© {currentYear} Baristation. All rights reserved.` 카피라이트 텍스트를 표시한다 (대소문자 혼합, Uppercase 지양). `currentYear`는 런타임에 동적으로 연산을 수행해야 한다 (`new Date().getFullYear()`).
2. 로고와 카피라이트를 양 끝에 배치하여 안정감을 제공한다

#### 6. Design Spec (디자인 명세)

- **Layout**: `flex justify-between items-center`, 좌: 로고 텍스트, 우: 카피라이트
- **Animation**: 없음
- **Typography**: `Inter`, Small, muted 색상(`Tertiary-Surface` 또는 Gray)
- **Responsive**: 모바일에서 세로 중앙 정렬로 전환

#### 7. Definition of Done (검증 기준)

- [ ] (기능) `© {currentYear} Baristation. All rights reserved.` 텍스트가 런타임 연도에 맞게 정확히 표시된다
- [ ] (디자인) 로고(좌)와 카피라이트(우)가 양 끝 배치된다
- [ ] (디자인) Uppercase 스타일이 적용되지 않은 담백한 라이트 테마 스타일이다

---

## 4. 아키텍처 요약

```
RootLayout
  ├── GlobalNav
  └── page.tsx (메인 엔트리)
        ├── HeroSection (Client Component - embla-carousel 캐러셀 및 모션)
        ├── FlavorNotes (Client Component - 향미 카드 그리드)
        │     └── FlavorCard × 8
        ├── RecommendedProducts (Client Component - 추천 원두 목록)
        │     └── ProductCard × N
        └── RoasteryMapSection (Client Component - useKakaoLoader 비동기 렌더링)
  └── Footer
```

**데이터 흐름**: `getMainDataAction` (Server Action)을 통해 메인 페이지에 필요한 데이터를 페칭하여 하위 컴포넌트에 Props로 주입합니다.

---

## 5. 핵심 동작 요구사항

- **SPA 라우팅 연동**: 로그인 페이지, 원두 정보 페이지 등 내부 라우팅 요소 완비
- **지도 라이브러리 연동**: `react-kakao-maps-sdk`를 통한 카카오 지도 기능 최적화
- **상단 GNB 이펙트**: 최상단 투명 → 스크롤 시 반투명/배경색 전환
- **실데이터 연동**: `getMainDataAction`을 통한 실제 추천 상품 및 향미 데이터 연동

---

## 6. API 연동 명세

### 상황

> 메인페이지 로딩

### Request Header

| key           | value    |
| ------------- | -------- |
| Authorization | Bearer ~ |

### Request Body

| Name | Type | Description | null 여부 | 형식 |
| ---- | ---- | ----------- | --------- | ---- |
|      |      |             |           |      |

### Response Header

```bash
// 성공
HTTP/1.1 200 OK

// 실패
HTTP/1.1 400

1. 토큰 승인 실패
```

| key          | value            |
| ------------ | ---------------- |
| Content-Type | application/json |

### Response Body

| Name                    | Type  | Description                                                                                                                               |
| :---------------------- | :---- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **flavors**             | array | 향미 목록 (`id`, `name`, `imageUrl`, `link`)                                                                                              |
| **recommendedProducts** | array | 추천 원두 목록 (`id`, `name`, `origin`, `primaryFlavor`, `flavorImageUrl`, `link`, `balance`, `sweetness`, `acidity`, `body`, `roasting`) |

### Success JSON

```json
{
  "flavors": [
    {
      "id": "cacao",
      "name": "카카오",
      "imageUrl": "https://example.com/images/cacao.jpg",
      "link": "/products?flavors=cacao"
    }
  ],
  "recommendedProducts": [
    {
      "id": 1,
      "name": "콜롬비아 엘 파라이소",
      "origin": "콜롬비아",
      "primaryFlavor": "복숭아",
      "flavorImageUrl": "이미지 링크",
      "link": "/products/1",
      "balance": 4,
      "sweetness": 5,
      "acidity": 4,
      "body": 3,
      "roasting": 2
    }
  ]
}
```
