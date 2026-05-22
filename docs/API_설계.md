# 백엔드 API 설계

## 엔드포인트

```
POST /api/graphql
```

단일 엔드포인트. 모든 요청은 GraphQL 쿼리로 처리.

---

## 스키마 (`src/server/schema.js`)

```graphql
type CurrentWeather {
  city:        String!
  country:     String!
  datetime:    String!   # ISO 8601 (서버 응답 시각)
  timezone:    Int!      # UTC 기준 초 단위 오프셋 (ex. Seoul = 32400)
  temperature: Float!    # 현재 온도 (섭씨)
  feelsLike:   Float!    # 체감 온도
  tempMin:     Float!    # 최저 온도
  tempMax:     Float!    # 최고 온도
  humidity:    Int!      # 습도 (%)
  description: String!   # 날씨 설명 (ex. "clear sky")
  icon:        String!   # OWM 아이콘 코드 (ex. "01d")
  windSpeed:   Float!    # 풍속 (m/s)
  visibility:  Int!      # 가시거리 (m)
  sunrise:     String!   # ISO 8601
  sunset:      String!   # ISO 8601
}

type ForecastItem {
  datetime:    String!   # ISO 8601 (3시간 간격)
  temperature: Float!
  feelsLike:   Float!
  tempMin:     Float!
  tempMax:     Float!
  humidity:    Int!
  description: String!
  icon:        String!
  windSpeed:   Float!
}

type DayForecast {
  date:  String!            # YYYY-MM-DD (현지 날짜)
  items: [ForecastItem!]!   # 해당 날짜의 3시간 간격 예보 항목 전체
}

type Forecast {
  city:       String!
  country:    String!
  population: Int            # 도시 인구 (null 허용)
  days:       [DayForecast!]! # 최대 5일치
}

type Query {
  currentWeather(city: String!): CurrentWeather!
  forecast(city: String!):       Forecast!
}
```

---

## Resolver (`src/server/resolvers.js`)

### `currentWeather`

**요청**
```
GET https://api.openweathermap.org/data/2.5/weather
  ?q={city}
  &units=metric
  &appid={OPENWEATHER_API_KEY}
```

**OWM 응답 → GraphQL 타입 매핑**

| GraphQL 필드 | OWM 응답 경로 | 변환 |
|-------------|--------------|------|
| `city` | `name` | - |
| `country` | `sys.country` | - |
| `datetime` | - | `new Date().toISOString()` (응답 시각) |
| `timezone` | `timezone` | - |
| `temperature` | `main.temp` | - |
| `feelsLike` | `main.feels_like` | - |
| `tempMin` | `main.temp_min` | - |
| `tempMax` | `main.temp_max` | - |
| `humidity` | `main.humidity` | - |
| `description` | `weather[0].description` | - |
| `icon` | `weather[0].icon` | - |
| `windSpeed` | `wind.speed` | - |
| `visibility` | `visibility` | - |
| `sunrise` | `sys.sunrise` | Unix × 1000 → ISO 8601 |
| `sunset` | `sys.sunset` | Unix × 1000 → ISO 8601 |

---

### `forecast`

**요청**
```
GET https://api.openweathermap.org/data/2.5/forecast
  ?q={city}
  &units=metric
  &appid={OPENWEATHER_API_KEY}
```

**5일 예보 가공 로직 (`groupByDay`)**

OWM은 3시간 간격 최대 40개 항목을 반환.  
→ 현지 타임존 기준으로 날짜별 그룹핑 후 최대 5일치 반환.

```
1. 현재 시각(Unix) 기준으로 과거 항목 제외 (dt <= nowSeconds)
2. timezone 오프셋을 적용해 현지 날짜(YYYY-MM-DD) 계산
3. 현지 날짜를 key로 그룹핑
4. 날짜 오름차순 정렬 → 최대 5일 slice
5. 각 항목을 ForecastItem 구조로 매핑
```

**OWM 응답 → GraphQL 타입 매핑**

| GraphQL 필드 | OWM 응답 경로 |
|-------------|--------------|
| `city` | `city.name` |
| `country` | `city.country` |
| `population` | `city.population` |
| `days[].date` | 현지 날짜 (timezone 오프셋 적용, YYYY-MM-DD) |
| `days[].items[].datetime` | `list[n].dt` (Unix × 1000 → ISO 8601, UTC 기준 저장) |
| `days[].items[].temperature` | `list[n].main.temp` |
| `days[].items[].feelsLike` | `list[n].main.feels_like` |
| `days[].items[].tempMin` | `list[n].main.temp_min` |
| `days[].items[].tempMax` | `list[n].main.temp_max` |
| `days[].items[].humidity` | `list[n].main.humidity` |
| `days[].items[].description` | `list[n].weather[0].description` |
| `days[].items[].icon` | `list[n].weather[0].icon` |
| `days[].items[].windSpeed` | `list[n].wind.speed` |

---

## 에러 처리

| 상황 | 처리 방법 |
|------|----------|
| 지원하지 않는 도시 | `GraphQLError` throw — `"City not found"` (`CITY_NOT_FOUND`) |
| OWM API 404 | `GraphQLError` throw — `"City not found"` (`CITY_NOT_FOUND`) |
| OWM API 4xx/5xx | `GraphQLError` throw — `"Weather API request failed"` (`EXTERNAL_API_ERROR`) |
| API Key 없음 | 서버 시작 시 `console.error` 경고 (런타임 시 401로 이어짐) |
| 네트워크 타임아웃 | fetch timeout 5000ms — `REQUEST_TIMEOUT` |

---

## 허용 도시 목록 검증

```js
// src/lib/constants.js — [city].js와 resolvers.js에서 공통 import
import { CITIES } from '../lib/constants';

// resolver 진입 시 검증
if (!CITIES.includes(city)) {
  throw new GraphQLError('City not found', {
    extensions: { code: 'CITY_NOT_FOUND' },
  });
}
```

---

## Apollo Server 설정 (`src/pages/api/graphql.js`)

```js
import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '../../server/schema';
import { resolvers } from '../../server/resolvers';

const server = new ApolloServer({ typeDefs, resolvers });
const handler = server.createHandler({ path: '/api/graphql' });

export const config = { api: { bodyParser: false } };
export default handler;
```

---

## 요청 / 응답 예시

### 현재 날씨 요청
```json
POST /api/graphql
{
  "query": "query GetCurrentWeather($city: String!) { currentWeather(city: $city) { city country temperature feelsLike humidity description icon windSpeed } }",
  "variables": { "city": "Seoul" }
}
```

### 현재 날씨 응답
```json
{
  "data": {
    "currentWeather": {
      "city": "Seoul",
      "country": "KR",
      "temperature": 22.4,
      "feelsLike": 21.8,
      "humidity": 60,
      "description": "clear sky",
      "icon": "01d",
      "windSpeed": 3.2
    }
  }
}
```

### 5일 예보 응답
```json
{
  "data": {
    "forecast": {
      "city": "Seoul",
      "country": "KR",
      "population": 10349312,
      "days": [
        {
          "date": "2026-05-23",
          "items": [
            {
              "datetime": "2026-05-23T03:00:00.000Z",
              "temperature": 24.1,
              "humidity": 55,
              "description": "few clouds",
              "icon": "02d"
            }
          ]
        }
      ]
    }
  }
}
```

### 에러 응답
```json
{
  "errors": [
    {
      "message": "City not found",
      "extensions": { "code": "CITY_NOT_FOUND" }
    }
  ]
}
```

---

## 환경 변수

```bash
# .env.local
OPENWEATHER_API_KEY=your_api_key_here
```
