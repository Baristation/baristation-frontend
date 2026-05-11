---
trigger: always_on
---

# AI Context & Global Rules

이 문서는 AI 어시스턴트가 프로젝트 파악 및 코드 작성 시 항상 최우선으로 지켜야 하는 전역 규칙입니다.

## 1. Core Operating Principles (핵심 동작 원칙)

### 1.1 AI Agent Behavior

- **사전 검토 및 문제 제기 (Proactive Feedback)**: 작업을 시작하기 전에 사용자의 지시사항에 논리적 오류, 모순, 혹은 더 나은 아키텍처/설계 방향성이 보인다면 **즉시 코드 작성을 시작하지 말고 사용자에게 의문을 제기**해야 합니다. 개선 사항을 먼저 제안하고 논의하십시오.
- **7단계 생명주기 준수 (Lifecycle Compliance)**: AI 에이전트는 `.agents/workflows/vibe-coding-cycle.md`에 정의된 **7단계 생명주기를 절대적으로 준수**해야 합니다.
- **허가 단계 준수 (Approval Gate)**: 사용자가 자동 실행을 명시적으로 허락했거나 구조에 영향을 주지 않는 단순한 수정이 아닌 이상, 구두 승인 없이 즉시 애플리케이션 코드를 수정해서는 안 됩니다.
- **하네스 엔지니어링 (Harness Engineering)**: 에이전트가 자율적으로 코드를 실행, 테스트, 검증하고 스스로 오류를 수정할 수 있는 '하네스' 환경을 설계하고 구축해야 합니다. (Rule 22 준수)
- **외부 AI 리포트 대응**: 사용자가 'Prompt for AI Agents' 형식의 리포트 조각을 제공하는 경우, `.agents/workflows/ai-review-lifecycle.md` 워크플로우에 따라 수행합니다.
- **다음 작업 제안 (Next Action Suggestions)**: 작업 완료 후 다음에 진행할 수 있는 작업을 2~3가지 제시합니다.

### 1.2 Documentation & Review

- **문서 수정 사전 검토제**: 문서 업데이트 지시 시, 먼저 편집 계획(어떤 문서의 어떤 내용)을 브리핑하고 승인을 받은 후 수행합니다.
- **구현 전 스펙 선반영**: 구현 내용이 기존 스펙과 달라지는 경우, 코드 수정에 앞서 반드시 해당 컴포넌트의 스펙(`specs/`)을 먼저 업데이트해야 합니다. (Rule 29 준수)
- **세션 시작 보고**: 새로운 세션 시작 시 규칙 숙지와 `PLAN.md` 확인 완료 여부를 사용자에게 보고합니다. (Rule 24 준수)

## 2. Documentation Strategy (문서 관리 규칙)

### 2.1 Specs & Implementation Records

- **Specs 중심 관리**: 모든 화면 및 기능 명세는 `specs/` 하위에 작성하며, **구현 완료 즉시 변경 사항을 반영**하여 최신 상태를 유지합니다.
  - 스펙 변경 시 **반드시 결정 사유(Reason / Context)**를 함께 명시합니다.
  - 페이지 스펙 작성 시 반드시 `specs/common-ui-spec.md`를 먼저 확인하여 디자인 토큰 및 공통 UI 패턴과의 일관성을 확보합니다.
- **기록 채널 단일화**: 모델의 **답변**과 상세한 **Git 커밋 메시지**를 작업 이력의 주 저장소로 활용합니다.
  - 커밋 메시지는 구현 내용, 변경된 파일, 결정 사유를 포함하여 기술합니다.
- **PLAN.md**: 프로젝트의 전체적인 방향성과 마일스톤 관리를 위해 유지하되, 세부 변경 이력 나열은 지양합니다.

## 3. Tech Stack & Environment (기술 스택 및 환경)

- **Workspace**: PNPM Monorepo 기반. 확립된 모노레포 구조와 명명 규칙을 엄격하게 준수합니다.
- **Next.js & Server**: 서버는 `apps/web/` 내에서 구동되므로, 환경변수(`.env.local` 등)는 해당 디렉토리 내부에 위치해야 합니다.
- **Commands**: 패키지 구동 및 스크립트 실행은 반드시 `pnpm --filter @coffee-service/web <명령어>` 형식을 사용합니다.
- **Core Stack**: Next.js 15 App Router, Tailwind CSS v4, `lucide-react`, `framer-motion`, `Zustand`, `TanStack Query`.
- **TypeScript**: TypeScript의 모범 사례와 타입 안전성(Type Safety)을 항상 엄격하게 유지합니다.

## 4. Implementation Principles (구현 및 아키텍처 원칙)

### 4.1 Component Design

- **UI 라이브러리 우선**: 모든 핵심 UI 요소는 반드시 `ui-library` 패키지의 공용 컴포넌트를 우선적으로 활용합니다.
- **선언적 컴포넌트 설계**: 복합 UI 요소 설계 시 **Compound Component 패턴**을 적극 활용합니다. (예: `<DropMenu.Root>`, `<DropMenu.Trigger>`)
- **레이아웃 래퍼 의무화**: 개별 페이지 콘텐츠는 공용 레이아웃 컨테이너(`@/components/layout/PageContainer.tsx`) 내부에 작성하여 일관된 여백과 간섭 방지를 보장합니다.

### 4.2 State & Data

- **전역 오버레이 상태 중앙화**: 모달, 드로어 등 전역 UI는 `Zustand` 스토어로 관리하여 최상단에서 단 하나만 렌더링되게 제어합니다.
- **데이터 페칭 아키텍처**:
  - 초기 랜딩에 필요한 데이터 페칭 및 단순 조작은 **Server Component**와 **Server Action**을 최우선으로 사용합니다.
  - 무한 스크롤, 실시간 검색 등 고도화된 클라이언트 상호작용이 필요한 경우에만 **TanStack Query**를 결합합니다.

### 4.3 Design Aesthetic

- **심미성 (Premium Feel)**: 기능 동작 이상으로 심미성과 사용자 경험을 최고 수준으로 고려합니다. 부드러운 전환을 위해 `framer-motion`을 적극 활용합니다.
