# Blog / Freshoh Works Handoff Guide

이 저장소는 `Express + 정적 HTML + JSON 파일 저장` 방식으로 동작하는 간단한 CMS형 프로젝트입니다.

핵심은 두 갈래입니다.

- `기존 앱 경로`: 로컬 서버에서 실제 편집/조회에 사용하는 메인 경로
- `v2 / 정적 export 경로`: GitHub Pages용 정적 결과물을 만들기 위한 별도 템플릿 경로

`v2` 디렉터리가 따로 있어서 헷갈릴 수 있지만, **현재 편집 기능이 붙어 있는 실운영 경로는 루트 HTML + admin + server.js 조합**입니다.

---

## 1. 빠른 시작

### 로컬 실행

```bash
npm install
npm run dev
```

또는

```bash
npm start
```

기본 주소:

- 메인: `http://127.0.0.1:3000/`
- 관리자 목록: `http://127.0.0.1:3000/admin/`
- 에디터: `http://127.0.0.1:3000/admin/editor.html`
- 설정: `http://127.0.0.1:3000/admin/settings.html`
- v2 미리보기: `http://127.0.0.1:3000/v2/`

---

## 2. 가장 중요한 파일 맵

### 실제 앱 동작 경로

- [server.js](/c:/Users/lg/blog/server.js)
  - 전체 서버 엔트리
  - 정적 파일 서빙
  - 글 CRUD API
  - 업로드 API
  - 글 순서 재정렬 API
  - `v2` 라우트 연결

- [index.html](/c:/Users/lg/blog/index.html)
  - 기존 메인 목록 페이지
  - `/api/posts`, `/api/settings`를 읽어 메인 화면 렌더링

- [article.html](/c:/Users/lg/blog/article.html)
  - 기존 글 상세 페이지
  - `/api/posts/:id`를 읽어 상세 본문 렌더링

- [styles.css](/c:/Users/lg/blog/styles.css)
  - 기존 메인/상세 공통 스타일

- [admin/index.html](/c:/Users/lg/blog/admin/index.html)
  - 관리자 글 목록
  - 현재는 드래그 앤 드롭 순서 변경 포함

- [admin/editor.html](/c:/Users/lg/blog/admin/editor.html)
  - 글 작성/수정 에디터
  - 이미지 업로드와 블록 편집 담당

- [admin/settings.html](/c:/Users/lg/blog/admin/settings.html)
  - 사이트 설정 편집

### 데이터 파일

- [posts/posts.json](/c:/Users/lg/blog/posts/posts.json)
  - 글 데이터 저장소
  - 제목, 요약, 본문(Editor.js JSON 문자열), 썸네일, 공개 여부, 순서 포함
  - 현재 메인 목록 정렬 순서의 원본

- [posts/settings.json](/c:/Users/lg/blog/posts/settings.json)
  - 사이트명, 히어로 텍스트 등 전역 설정 저장

- `uploads/`
  - 업로드 이미지 저장 폴더
  - 원본 또는 `thumb/body/hero` 파생 이미지가 저장됨
  - `posts.json`, `settings.json`이 이 경로를 직접 참조함

---

## 3. v2 / site / 기존 루트의 차이

이 프로젝트에서 가장 헷갈릴 수 있는 부분입니다.

### A. 루트 버전: 현재 편집 가능한 메인 앱

- [index.html](/c:/Users/lg/blog/index.html)
- [article.html](/c:/Users/lg/blog/article.html)
- [styles.css](/c:/Users/lg/blog/styles.css)
- [admin/editor.html](/c:/Users/lg/blog/admin/editor.html)
- [admin/index.html](/c:/Users/lg/blog/admin/index.html)
- [admin/settings.html](/c:/Users/lg/blog/admin/settings.html)

설명:

- 이 조합이 **실제 CMS처럼 동작하는 메인 앱**입니다
- 관리자에서 글을 수정하면 `posts/posts.json`이 바뀝니다
- 이미지 업로드는 `uploads/`에 저장됩니다
- 개발팀이 기능 수정할 때 **기본적으로 먼저 봐야 하는 경로**입니다

### B. `v2/`: 정적/대안 템플릿 소스

- [v2/index.html](/c:/Users/lg/blog/v2/index.html)
- [v2/project.html](/c:/Users/lg/blog/v2/project.html)
- [v2/styles.css](/c:/Users/lg/blog/v2/styles.css)

설명:

- `v2`는 별도 디자인 방향으로 만든 **대안 프론트엔드 템플릿**입니다
- 메인 CMS 경로의 직접 편집 대상은 아닙니다
- 서버에서 `/v2/`, `/v2/project.html`로 직접 열어볼 수는 있습니다
- 정적 Pages 산출물의 뷰 소스로 사용됩니다

### C. `site/`: 생성된 정적 결과물

- `site/` 디렉터리는 직접 편집하는 소스가 아닙니다
- `scripts/export-static.js`가 생성하는 **빌드 산출물**입니다
- GitHub Pages용 정적 결과물 확인 용도입니다

정리:

- 기능 수정: `루트 + admin + server.js`
- 정적 Pages 스타일 수정: `v2/`
- 정적 결과물 확인: `site/`

---

## 4. 정적 배포 관련 파일

- [scripts/export-static.js](/c:/Users/lg/blog/scripts/export-static.js)
  - `posts/posts.json`, `posts/settings.json`, `uploads/`를 읽어
  - `site/` 정적 산출물을 생성
  - 현재는 `v2/styles.css`와 `v2` 기반 상세 구조를 사용

- [.github/workflows/deploy-pages.yml](/c:/Users/lg/blog/.github/workflows/deploy-pages.yml)
  - 정적 Pages 배포 워크플로 파일

- [package.json](/c:/Users/lg/blog/package.json)
  - `build:static` 스크립트 정의

정적 export 실행:

```bash
npm run build:static
```

---

## 5. 요청 흐름

### 글 조회

1. 브라우저가 `index.html` 또는 `article.html` 요청
2. 클라이언트가 `/api/posts`, `/api/posts/:id`, `/api/settings` 호출
3. 서버가 `posts/posts.json`, `posts/settings.json`을 읽어 응답
4. 본문/목록이 브라우저에서 렌더링

### 글 수정

1. 관리자가 `admin/editor.html`에서 수정
2. 저장 시 `/api/posts` 또는 `/api/posts/:id` 호출
3. 서버가 `posts/posts.json` 갱신

### 글 순서 변경

1. 관리자가 `admin/index.html`에서 드래그
2. `/api/posts/reorder` 호출
3. 서버가 `posts/posts.json` 배열 순서를 그대로 다시 저장

### 이미지 업로드

1. 관리자가 업로드
2. `/api/upload` 호출
3. 서버가 `sharp`로 `thumb/body/hero` 파생 이미지 생성
4. `uploads/` 저장
5. 반환된 경로가 `posts/posts.json` 또는 `settings.json`에 저장됨

---

## 6. 수정 시 우선순위 가이드

### 콘텐츠/에디터 문제를 수정할 때

먼저 볼 파일:

- [admin/editor.html](/c:/Users/lg/blog/admin/editor.html)
- [admin/index.html](/c:/Users/lg/blog/admin/index.html)
- [article.html](/c:/Users/lg/blog/article.html)
- [server.js](/c:/Users/lg/blog/server.js)
- [posts/posts.json](/c:/Users/lg/blog/posts/posts.json)

### 메인 디자인을 수정할 때

기존 경로를 수정하려면:

- [index.html](/c:/Users/lg/blog/index.html)
- [styles.css](/c:/Users/lg/blog/styles.css)

정적 Pages용 v2 스타일을 수정하려면:

- [v2/index.html](/c:/Users/lg/blog/v2/index.html)
- [v2/project.html](/c:/Users/lg/blog/v2/project.html)
- [v2/styles.css](/c:/Users/lg/blog/v2/styles.css)
- [scripts/export-static.js](/c:/Users/lg/blog/scripts/export-static.js)

---

## 7. 개발팀 전달 시 참고 사항

- 이 프로젝트는 DB 없이 JSON 파일을 직접 수정하는 구조입니다
- `posts/posts.json`과 `uploads/`는 항상 세트로 봐야 합니다
- 이미지가 깨지면 대부분 `posts.json`에 기록된 `uploads/*`가 저장소에 없는 경우입니다
- `samplepost/`는 작업 초안/참고 자료 폴더이며, 앱 런타임 필수 폴더는 아닙니다
- `site/`는 generated output이므로 수정이 필요하면 보통 `v2/` 또는 `scripts/export-static.js`를 고쳐야 합니다

---

## 8. 한 줄 요약

개발팀이 먼저 봐야 할 핵심은 아래입니다.

1. 메인 앱: `server.js` + `index.html` + `article.html` + `admin/*`
2. 데이터: `posts/posts.json` + `posts/settings.json` + `uploads/`
3. 정적 Pages 계열: `v2/*` + `scripts/export-static.js` + `site/`

즉, **`v2`는 대안/정적 템플릿 계열이고, 실제 편집 가능한 메인 앱은 루트 HTML + admin + server.js`입니다.**
