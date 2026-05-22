# Bzznbyd — Weather App

Seoul · Tokyo · Paris · London 4개 도시의 현재 날씨와 5일 예보를 보여주는 웹 앱입니다.

**Stack** — Next.js 12 · GraphQL (Apollo Client v4 + apollo-server-micro) · OpenWeatherMap API · CSS Modules

---

## 사전 요구사항

- [nvm](https://github.com/nvm-sh/nvm)
- [OpenWeatherMap API 키](https://openweathermap.org/api) (무료 플랜으로 발급 가능)

---

## 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/Jieun13/Bzznbyd_assignment.git
cd Bzznbyd_assignment
```

### 2. 앱 디렉토리로 이동 & Node 버전 설정

```bash
cd bzznbyd
nvm install 18   # Node 18이 없다면 먼저 설치
nvm use 18
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 환경 변수 설정

`bzznbyd/` 안에 `.env.local` 파일을 생성합니다.

```bash
echo "OPENWEATHER_API_KEY=여기에_API_키_입력" > .env.local
```

> **API 키 발급:** [openweathermap.org/api](https://openweathermap.org/api) 에서 발급.

### 5. 실행

- 개발 서버 → http://localhost:3000
```bash
npm run dev
```

- 프로덕션
```bash
npm run build && npm start   
```

---

## 리포지토리 구조

```
Bzznbyd_assignment/
├── README.md
├── docs/
│   ├── API_설계.md
│   ├── 아키텍처.md
│   └── 요구사항.md
└── bzznbyd/                     # Next.js 앱
    ├── src/
    │   ├── pages/
    │   │   ├── index.js             # 홈 — 도시 선택 화면
    │   │   ├── [city].js            # 도시별 날씨 상세 (SSR)
    │   │   └── api/graphql.js       # GraphQL API 엔드포인트
    │   ├── server/
    │   │   ├── schema.js            # GraphQL 타입 정의
    │   │   └── resolvers.js         # OpenWeatherMap API 호출 + 데이터 가공
    │   ├── components/
    │   │   ├── CityButton/
    │   │   ├── CurrentWeather/
    │   │   ├── ForecastList/
    │   │   └── Layout/
    │   ├── lib/
    │   │   ├── apolloClient.js      # Apollo Client 설정
    │   │   ├── constants.js         # 허용 도시 목록
    │   │   ├── formatTime.js        # 날짜/시간 포맷 유틸
    │   │   └── queries.js           # GraphQL 쿼리
    │   └── styles/                  # CSS Modules
    ├── public/                      # 정적 파일
    ├── .env.local                   # 환경 변수 (git 제외 — 직접 생성 필요)
    ├── .nvmrc                       # Node 18 지정
    └── next.config.js
```

---

## 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|------|------|------|
| 날씨 데이터가 안 뜸 | API 키 미설정/활성화 대기 | `.env.local` 확인 |
| `ESLint: Invalid Options` | ESLint 버전 충돌 | `rm -rf node_modules && npm install` |
| `Cannot find module 'next'` | 의존성 미설치 | `npm install` 실행 |
| 포트 충돌 | 3000번 포트 사용 중 | `npm run dev -- -p 3001` 으로 다른 포트 사용 |
