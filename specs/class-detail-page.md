# 클래스 상세 페이지 명세서 (Class Detail Page) - Baristation

## 1. 페이지 개요

특정 클래스의 상세 정보(강사 프로필, 커리큘럼, 일정, 환불 정책)를 제공하고, 사이드바를 통한 예약 액션을 지원하는 상세 페이지입니다.

- **Route**: `/classes/[lessonId]`
- **Page Entry**: `apps/web/app/(main)/classes/[lessonId]/page.tsx`

---

## 2. 디자인 시스템 참조

모든 디자인 토큰은 [공통 UI 명세서(common-ui-spec.md)](common-ui-spec.md)를 기반으로 합니다.

**페이지 무드: "Expert Stage"** — 바리스타의 전문성이 전면에 드러나며, 사용자가 클래스에 대한 신뢰와 기대감을 형성하도록 구성합니다.

---

## 3. 페이지 레이아웃 구조

```text
[Desktop (≥1024px)]
┌──────────────────────────────────────────────────────┐
│  GlobalNav                                           │
│──────────────────────────────────────────────────────│
│  ┌────────────────────────────────────┐  ┌─────────┐ │
│  │  이미지 갤러리 (Hero Carousel)     │  │ Sticky  │ │
│  │────────────────────────────────────│  │ Side-   │ │
│  │  클래스 제목 / 바리스타 카드 섹션  │  │ Bar     │ │
│  │────────────────────────────────────│  │         │ │
│  │  퀵 인포 그리드 (4열)             │  │ [카드 1]│ │
│  │────────────────────────────────────│  │ - 달력  │ │
│  │  커리큘럼 섹션                     │  │         │ │
│  │────────────────────────────────────│  │ [카드 2]│ │
│  │  환불 정책 섹션                    │  │ - 가격  │ │
│  │                                    │  │ - 예약  │ │
│  └────────────────────────────────────┘  └─────────┘ │
└──────────────────────────────────────────────────────┘

[Mobile (<1024px)]
┌──────────────────────────┐
│  GlobalNav               │
│  이미지 갤러리           │
│  클래스 제목/바리스타    │
│  퀵 인포 그리드 (2열)    │
│  커리큘럼 섹션           │
│  환불 정책 섹션          │
│──────────────────────────│
│  Fixed Bottom Bar        │  ← 가격 + 예약 버튼 (찜하기 없음)
└──────────────────────────┘
```

---

## 4. 컴포넌트 명세 (Component Specs)

---

### LessonImageGallery

#### 1. Overview (맥락)

- **목적**: 클래스 이미지를 슬라이더 형태로 보여주는 Hero 갤러리 컴포넌트
- **위치**: `apps/web/components/class/detail/LessonImageGallery.tsx`
- **부모 컴포넌트**: `class/[lessonId]/page.tsx`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `embla-carousel-react`, `next/image`, `framer-motion`
- **기타 제약**: 첫 번째 이미지(`sortOrder: 0`)에 `priority` 속성 부여 (LCP 최적화)

#### 3. Data Interface (I/O)

```ts
interface LessonImage {
  lessonImageId: number;
  imageType: 'THUMB' | 'DETAIL';
  imageUrl: string;
  sortOrder: number;
}

interface LessonImageGalleryProps {
  images: LessonImage[];
}
```

#### 4. UI States (상태 명세)

| 상태        | 트리거 조건    | UI 표현                          |
| ----------- | -------------- | -------------------------------- |
| **Default** | 초기 렌더링    | 첫 이미지 노출 + 하단 인디케이터 |
| **Loading** | 이미지 로딩 중 | Skeleton Placeholder             |
| **Single**  | 이미지 1장     | 슬라이더 없이 단일 이미지 노출   |

#### 5. Functional Requirements

1. `sortOrder` 기준 오름차순으로 이미지를 정렬하여 슬라이더로 표시한다
2. 하단에 현재 슬라이드 인디케이터(점)를 표시한다
3. 이미지가 1장인 경우 슬라이더 없이 단일 이미지를 표시한다
4. 이미지 로딩 전까지 동일 크기의 Skeleton을 표시한다

#### 6. Design Spec (디자인 명세)

- **Layout**: `w-full aspect-[16/9] rounded-3xl overflow-hidden`
- **Image**: `object-cover fill`, 첫 이미지 `priority`
- **Indicator**: 하단 중앙 dot 인디케이터, 활성 dot `bg-amber-500 w-6`, 비활성 `bg-white/40 w-2`
- **Animation**: 슬라이드 전환 `ease-out 0.3s`

#### 7. Definition of Done (검증 기준)

- [ ] (기능) 이미지 복수 시 슬라이더가 동작한다
- [ ] (기능) 이미지 1장 시 슬라이더 컨트롤이 노출되지 않는다
- [ ] (성능) 첫 이미지에 `priority` 속성이 적용된다
- [ ] (디자인) 로딩 중 Skeleton이 동일 크기로 유지된다

---

### HostCard

#### 1. Overview (맥락)

- **목적**: 바리스타의 프로필 사진, 이름, 전문 이력을 강조하여 클래스 신뢰도를 높이는 강사 소개 카드
- **위치**: `apps/web/components/class/detail/HostCard.tsx`
- **부모 컴포넌트**: `class/[lessonId]/page.tsx`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: `next/image`, Tailwind CSS v4, `framer-motion`

#### 3. Data Interface (I/O)

```ts
interface HostCardProps {
  hostName: string;
  hostProfileUrl: string;
  careers: string[]; // ["SCA Certified Professional", "KBC Winner 2022"]
}
```

#### 4. UI States (상태 명세)

| 상태          | 트리거 조건        | UI 표현                     |
| ------------- | ------------------ | --------------------------- |
| **Default**   | 초기 렌더링        | 프로필 이미지 + 이름 + 경력 |
| **No Career** | `careers` 비어있음 | 경력 섹션 미노출            |

#### 5. Functional Requirements

1. 바리스타 프로필 이미지를 원형으로 표시한다 (80×80px)
2. 이름 아래에 경력 배지를 태그 형태로 나열한다
3. `careers` 배열이 비어있는 경우 경력 섹션을 렌더링하지 않는다

#### 6. Design Spec (디자인 명세)

- **Layout**: `bg-surface-card rounded-2xl p-6 flex items-center gap-6`
- **Profile Image**: `w-20 h-20 rounded-full ring-2 ring-amber-500/50 object-cover`
- **Name**: `font-playfair text-2xl font-bold text-text-main`
- **Career Badge**: `rounded-full px-3 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30`
- **Animation**: 마운트 시 `opacity: 0 → 1`, `x: -20 → 0`, Duration `0.4s easeOut`

#### 7. Definition of Done (검증 기준)

- [ ] (기능) `careers` 비어있을 시 경력 섹션이 노출되지 않는다
- [ ] (디자인) 프로필 이미지가 원형으로 렌더링된다
- [ ] (디자인) 경력 배지가 amber 계열로 강조된다

---

### QuickInfoGrid

#### 1. Overview (맥락)

- **목적**: 일정, 소요 시간, 장소, 준비물 정보를 아이콘과 함께 4열 그리드로 배치하여 핵심 수강 조건을 즉시 파악하게 하는 컴포넌트
- **위치**: `apps/web/components/class/detail/QuickInfoGrid.tsx`
- **부모 컴포넌트**: `class/[lessonId]/page.tsx`

#### 3. Data Interface (I/O)

```ts
interface QuickInfoGridProps {
  region: string;
  city: string;
  place: string;
  duration: number; // 분 단위 (예: 120 → "2시간")
  nextDate: string | null; // ISO datetime
}
```

#### 4. UI States (상태 명세)

| 상태            | 트리거 조건      | UI 표현              |
| --------------- | ---------------- | -------------------- |
| **Default**     | 초기 렌더링      | 4개 정보 그리드 노출 |
| **No Schedule** | `nextDate: null` | "일정 미정" 표시     |

#### 5. Functional Requirements

1. `MapPin` 아이콘 + `region · city · place`를 하나의 셀로 표시한다
2. `Clock` 아이콘 + `duration`을 `N시간 M분` 형식으로 변환하여 표시한다
3. `CalendarDays` 아이콘 + `nextDate`를 `YYYY년 MM월 DD일 HH:MM` 형식으로 표시한다
4. `nextDate`가 null인 경우 "일정 미정"으로 표시한다

#### 6. Design Spec (디자인 명세)

- **Layout**: 데스크톱 4열 / 모바일 2열 Grid, `gap-4`
- **Cell**: `bg-surface-card rounded-2xl p-4 flex flex-col gap-2`
- **Icon**: `text-amber-500 w-5 h-5`
- **Label**: `font-outfit text-xs text-text-muted uppercase tracking-wider`
- **Value**: `font-inter text-sm font-medium text-text-main`

#### 7. Definition of Done (검증 기준)

- [ ] (기능) `duration` 120 입력 시 "2시간"으로 표시된다
- [ ] (기능) `nextDate` null 시 "일정 미정"이 표시된다
- [ ] (반응형) 모바일 2열 / 데스크톱 4열 그리드가 동작한다

---

### LessonScheduleCalendar

#### 1. Overview (맥락)

- **목적**: 클래스 일정 목록 및 각 날짜의 **잔여석 현황**을 캘린더 형태로 시각화하여 사용자가 원하는 날짜를 직관적으로 선택할 수 있게 하는 컴포넌트
- **위치**: `apps/web/components/class/detail/LessonScheduleCalendar.tsx`
- **부모 컴포넌트**: `BookingSidebar`

#### 3. Data Interface (I/O)

```ts
interface LessonScheduleCalendarProps {
  schedules: string[]; // ISO datetime 배열
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  remainingSeats: Record<string, number>; // 날짜별 잔여석 정보 (예: {"2026-05-20": 3})
}
```

#### 4. UI States (상태 명세)

| 상태               | 트리거 조건    | UI 표현                                        |
| ------------------ | -------------- | ---------------------------------------------- |
| **Default**        | 초기 렌더링    | 현재 월 캘린더 + 일정 날짜 강조                |
| **Selected**       | 날짜 선택      | 선택 날짜 `brand-primary` 배경                 |
| **Capacity Badge** | 일정 있는 날짜 | 날짜 텍스트 하단에 `N석` 또는 `마감` 정보 표시 |

#### 5. Functional Requirements

1. 월 캘린더를 렌더링하며, `schedules`에 포함된 날짜에 대해 `remainingSeats`를 매핑한다.
2. 잔여석이 1석 이상인 경우 초록색(`text-emerald-600`)의 **`N석`** 배지를 날짜 아래에 표시한다.
3. 잔여석이 0석인 경우 빨간색(`text-rose-600`)의 **`마감`** 배지를 표시하며, 해당 날짜는 선택 불가(Disabled) 상태로 비활성화한다.
4. 일정 있는 날짜 클릭 시 `onSelectDate`를 호출하고 해당 날짜를 강조 표시한다.
5. 이전/다음 월 이동 버튼을 제공한다.

---

### CurriculumSection

#### 1. Overview (맥락)

- **목적**: 클래스의 단계별 커리큘럼을 대형 넘버링과 함께 시각화하여 학습 경로와 기대감을 전달하는 섹션
- **위치**: `apps/web/components/class/detail/CurriculumSection.tsx`
- **부모 컴포넌트**: `class/[lessonId]/page.tsx`

#### 3. Data Interface (I/O)

```ts
interface CurriculumItem {
  title: string;
  subTitle: string;
  sortOrder: number;
}

interface CurriculumSectionProps {
  curriculum: CurriculumItem[];
}
```

---

### BookingSidebar

#### 1. Overview (맥락)

- **목적**: 사용자가 예약을 원활히 마칠 수 있도록 스택형 카드 레이아웃으로 구성된 데스크톱 우측 Sticky 사이드바 및 모바일 Fixed Bottom 바 컴포넌트
- **위치**: `apps/web/components/class/detail/BookingSidebar.tsx`
- **부모 컴포넌트**: `class/[lessonId]/page.tsx`

#### 2. Tech Stack & Constraints (기술 및 제약)

- **주요 도구**: Tailwind CSS v4, `framer-motion`, `lucide-react`
- **제약 사항**:
  - **찜하기(Wishlist) 기능 제거**: 시각적 디자인 단순화 및 예약 집중도를 위해 모든 찜하기 하트 아이콘 및 관련 로직을 제거함.
  - **다중 섹션 카드 분리**: 하나의 통합 카드였던 사이드바를 [달력 카드]와 [가격 및 신청하기 카드] 두 덩어리의 독립된 카드로 격리 및 재구성함.

#### 3. Data Interface (I/O)

```ts
interface BookingSidebarProps {
  lessonId: number;
  price: number;
  selectedDate: string | null;
  schedules: string[];
  remainingSeats: Record<string, number>;
  onSelectDate: (date: string) => void;
}
```

#### 4. UI States (상태 명세)

| 상태              | 트리거 조건 | UI 표현                                                         |
| ----------------- | ----------- | --------------------------------------------------------------- |
| **Default**       | 날짜 미선택 | 가격 정보 노출 + "날짜를 선택해주세요" 안내 및 예약 버튼 비활성 |
| **Date Selected** | 날짜 선택   | 예약 버튼 활성화 및 선택 일정 정보 표시                         |

#### 5. Functional Requirements

1. **상단 카드**: 일정 선택을 위한 `LessonScheduleCalendar`를 둥근 흰색 카드 내에 렌더링한다.
2. **하단 카드**: 가격 및 신청하기를 유도하는 카드를 렌더링한다.
3. **신청하기 액션**: 날짜 선택 후 "지금 바로 신청하기" 클릭 시 `/classes/{lessonId}/booking?date={selectedDate}` 경로로 이동한다.
4. **모바일 뷰**: 화면 하단에 `fixed bottom-0` 높이의 액션 폼으로만 가격 정보와 예약 신청 버튼을 제공한다.

#### 6. Design Spec (디자인 명세)

- **Desktop Layout**: `sticky top-24 w-80 flex flex-col gap-6` (2개의 둥근 카드 스택)
- **Mobile Layout**: `fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between z-50`
- **Price**: `font-outfit text-2xl font-bold text-gray-900`
- **CTA Button**: `rounded-2xl bg-[#3D261D] py-3.5 font-bold text-white text-sm hover:bg-[#2A1A14] transition-colors`

---

## 5. 아키텍처 요약

```text
classes/[lessonId]/page.tsx (Server Component - 초기 데이터 페칭)
  ├── LessonImageGallery      ← 이미지 갤러리 (Client)
  ├── HostCard                ← 바리스타 소개 (Server)
  ├── QuickInfoGrid           ← 퀵 인포 그리드 (Server)
  ├── CurriculumSection       ← 커리큘럼 (Server)
  ├── RefundPolicySection     ← 환불 정책 (Server)
  └── BookingSidebar          ← 예약 사이드바 (Client)
        └── LessonScheduleCalendar  ← 일정 캘린더 (Client)
```

**상태 관리**: `selectedDate`는 `class/[lessonId]/page.tsx` Client Wrapper에서 `useState`로 관리하며 `BookingSidebar`를 거쳐 `LessonScheduleCalendar`에 공유됩니다.
