# Romantic Lilac
> **Romantic Lilac**은 영화, 드라마, 애니메이션, 음악 등 일상 속에서 만나는 다양한 콘텐츠의 조각들을 모아 나만의 취향으로 아카이빙하는 개인화 기록 플랫폼입니다.

**React와 Vite**를 활용한 SPA(Single Page Application) 프로젝트입니다. 사용자가 감상한 다양한 미디어 콘텐츠를 검색하고, 자신만의 평점과 감상평을 기록할 수 있는 기능을 제공합니다.

## 🚀 프로젝트의 특징
* **다양한 카테고리 지원**: 영화, 드라마, 애니메이션, 게임, 음악, 도서 등 다양한 장르의 작품을 통합 관리.
* **데이터 기반 검색**: TMDB API 등 외부 API 연동을 통한 실시간 작품 정보 검색 및 포스터 출력 (구현 예정).
* **무한 스크롤 구현**

## 🛠 기술 스택
* **Frontend**: React, Vite
* **Styling**: CSS
* **Package Manager**: npm
* **API**: Fetch API (TMDB)

## 📂 프로젝트 구조
```text
romantic-lilac/
├── src/
│   ├── components/    # MovieCard, Navbar 등 재사용 가능한 UI 부품
│   ├── views/         # Home, SearchResult, MovieHome 등 페이지 단위 뷰
│   ├── services/      # Provider (API 요청 로직)
│   ├── styles/        # CSS 디자인 파일
│   ├── App.jsx        # 전체 렌더링 및 상태 관리 (Main Brain)
│   └── main.jsx       
└── .env               # API Key 등 보안 설정
```

## 업데이트 예정
**[ ] 평점 및 리뷰 모달**: 콘텐츠 클릭 시 상세 정보 확인 및 별점 기록 기능.

**[ ] 데이터 저장**: 사용자가 매긴 평점을 Baas(Supabase 기반)으로 저장.

**[ ] 뒤로가기 사용**: 실제 뒤로가기 버튼을 사용가능도록 library 도입.




## 💻 실행 방법
프로젝트를 로컬 환경에서 실행하려면 아래 명령어를 입력하세요.

1. **의존성 설치**
   ```bash
   npm install
   ```
2. **개발 서버 실행**
   ```bash
   npm run dev
   ```
1. **의존성 설치**
   ```bash
   npm run build
   ```