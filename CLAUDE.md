# CLAUDE.md

## 프로젝트 개요

마크다운(`.md`) 파일을 읽어 블로그 웹사이트로 변환하는 프로젝트. **프레임워크 없이 순수 HTML, CSS, JavaScript(바닐라)만 사용한다.**

## 기술 제약 (중요)

- React/Vue/Svelte/Next.js 등 UI 프레임워크 사용 금지.
- 번들러·트랜스파일러(Webpack, Vite, TypeScript 등) 사용 금지. 브라우저가 바로 실행할 수 있는 코드만 작성한다 (ES Modules 사용 가능).
- 외부 라이브러리는 최소화한다. 마크다운 파싱·코드 하이라이트가 필요하면 CDN 또는 `vendor/`에 복사한 단일 파일 라이브러리(예: marked, highlight.js)만 허용. 추가 전 사용자에게 확인한다.
- 빌드 단계 없이 정적 서버로 바로 동작하는 것을 기본으로 한다.

## 권장 구조

```
my-blog/
├── index.html          # 글 목록(홈)
├── post.html           # 글 상세 (쿼리: ?slug=...) 또는 해시 라우팅
├── posts/              # 마크다운 글 (예: 2026-10-03-hello.md)
│   └── index.json      # 글 목록 메타데이터 (slug, title, date, tags, summary)
├── css/
│   ├── base.css        # 리셋, CSS 변수(테마 토큰), 타이포그래피
│   └── components.css  # 헤더, 카드, 코드블록 등
├── js/
│   ├── main.js         # 진입점, 라우팅
│   ├── markdown.js     # 마크다운 → HTML 변환
│   ├── theme.js        # 다크모드 토글
│   └── posts.js        # 글 목록/상세 로딩
└── CLAUDE.md
```

구조는 구현 중 단순화해도 되지만, 관심사(파싱 / 테마 / 라우팅)는 파일 단위로 분리한다.

## 마크다운 처리 규칙

- 글은 `posts/*.md`에 둔다. 파일 상단에 YAML front matter(`title`, `date`, `tags`, `summary`)를 둔다.
- 브라우저는 `fetch()`로 마크다운을 읽는다. 따라서 `file://`로는 동작하지 않으며 로컬 정적 서버가 필요하다.
- 글 목록은 `posts/index.json`에서 읽는다. 목록을 자동 생성하는 스크립트가 필요하면 Node 의존성 없이 동작하는 단일 스크립트로 작성하고 사용자에게 알린다.
- 변환된 HTML을 `innerHTML`에 넣을 때는 XSS에 주의한다. 신뢰할 수 없는 마크다운이면 sanitize 한다.
- 지원 대상: 제목, 목록, 링크, 이미지, 인용, 표, 인라인/블록 코드(언어별 하이라이트), 가로줄.

## 디자인 가이드

- **깔끔하고 읽기 좋게**: 본문 폭 약 `65–72ch`, 줄간격 `1.7–1.8`, 본문 글자 크기 `17–18px`, 여백 넉넉하게.
- 한글 가독성을 고려한 폰트: `Pretendard`, `-apple-system`, `"Noto Sans KR"`, `system-ui` 순의 시스템 폰트 스택. 코드는 모노스페이스 스택.
- 장식은 최소화. 색상은 소수의 포인트 컬러 하나 + 중립 톤.
- 한국어 줄바꿈: 본문에 `word-break: keep-all; overflow-wrap: break-word;` 적용.
- 코드 블록은 가로 스크롤 처리, 표·이미지는 본문 폭을 넘치지 않게 한다 (`max-width: 100%`).

## 다크모드

- 모든 색상은 CSS 변수(`:root`)로 정의하고, `[data-theme="dark"]`에서 재정의한다.
- 초기값은 `prefers-color-scheme`를 따르고, 사용자가 토글하면 `localStorage`에 저장해 우선 적용한다.
- 깜빡임(FOUC) 방지: `<head>`에서 렌더 전에 인라인 스크립트로 `data-theme`를 설정한다.
- 본문·코드 블록·링크·인용·표 모두 라이트/다크 양쪽에서 대비(WCAG AA 이상)를 확인한다.
- 코드 하이라이트 테마도 라이트/다크에 맞춰 전환한다.

## 모바일 / 반응형

- `<meta name="viewport" content="width=device-width, initial-scale=1">` 필수.
- 모바일 우선(mobile-first)으로 CSS를 작성하고 `min-width` 미디어쿼리로 확장한다.
- 터치 타깃은 최소 44×44px. 가로 스크롤이 페이지 전체에 생기면 안 된다.
- 폰트 크기·여백은 `clamp()` 등으로 유동적으로 조정한다.
- 320px ~ 1440px 폭에서 확인한다.

## 접근성 / 품질

- 시맨틱 태그 사용(`header`, `nav`, `main`, `article`, `footer`), 이미지 `alt`, 키보드 포커스 표시 유지.
- 각 글 페이지의 `<title>`과 `meta description`을 글 메타데이터로 갱신한다.
- `prefers-reduced-motion`을 존중한다.

## 개발 / 실행

빌드가 없으므로 정적 서버만 띄우면 된다:

```bash
python -m http.server 8000
```

그 후 `http://localhost:8000` 접속. (Node가 있다면 `npx serve`도 가능)

## 코드 스타일

- JavaScript: ES2020+, ES Modules, `const`/`let`, 세미콜론 사용, 2칸 들여쓰기.
- CSS: CSS 변수 + 클래스 기반(BEM 유사), 전역 태그 선택자는 `base.css`에만.
- 파일/폴더명은 소문자 kebab-case. 글 파일명은 `YYYY-MM-DD-slug.md`.
- 주석과 UI 문구는 한국어, 식별자는 영어.
- 의존성과 코드는 필요한 만큼만 — 과설계 금지.

## 작업 시 주의

- 새 파일이나 라이브러리를 추가하기 전에 위 제약(프레임워크·빌드 금지)에 맞는지 확인한다.
- 기능 변경 후에는 라이트/다크, 모바일/데스크톱 양쪽에서 동작을 확인한다.
