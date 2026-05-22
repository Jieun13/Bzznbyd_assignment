import { GraphQLError } from 'graphql';
import { CITIES } from '../lib/constants';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const FETCH_TIMEOUT_MS = 5000;

if (!process.env.OPENWEATHER_API_KEY) {
  console.error('[resolvers] OPENWEATHER_API_KEY is not set — weather API calls will fail');
}

async function fetchOWM(endpoint, city) {
  const key = process.env.OPENWEATHER_API_KEY;
  const url = `${BASE_URL}/${endpoint}?q=${encodeURIComponent(city)}&units=metric&appid=${key}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, { signal: controller.signal });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new GraphQLError('Weather API request timed out', {
        extensions: { code: 'REQUEST_TIMEOUT' },
      });
    }
    throw new GraphQLError('Weather API request failed', {
      extensions: { code: 'EXTERNAL_API_ERROR' },
    });
  }
  clearTimeout(timer);

  if (res.status === 404) {
    throw new GraphQLError('City not found', {
      extensions: { code: 'CITY_NOT_FOUND' },
    });
  }
  if (!res.ok) {
    throw new GraphQLError('Weather API request failed', {
      extensions: { code: 'EXTERNAL_API_ERROR' },
    });
  }
  return res.json();
}

function groupByDay(list, timezoneOffset) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const groups = {};

  for (const item of list) {
    if (item.dt <= nowSeconds) continue;

    // date: 로컬 기준 그룹핑 / datetime: UTC, 표시 시 formatTime에서 offset 재적용
    const localDate = new Date(item.dt * 1000 + timezoneOffset * 1000);
    const date = localDate.toISOString().slice(0, 10);

    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  }

  return Object.keys(groups)
    .sort()
    .slice(0, 5)
    .map((date) => ({
      date,
      items: groups[date].map((item) => ({
        datetime: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        feelsLike: item.main.feels_like,
        tempMin: item.main.temp_min,
        tempMax: item.main.temp_max,
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        windSpeed: item.wind.speed,
      })),
    }));
}

export const resolvers = {
  Query: {
    currentWeather: async (_, { city }) => {
      if (!CITIES.includes(city)) {
        throw new GraphQLError('City not found', {
          extensions: { code: 'CITY_NOT_FOUND' },
        });
      }
      const data = await fetchOWM('weather', city);
      return {
        city: data.name,
        country: data.sys.country,
        datetime: new Date().toISOString(),
        timezone: data.timezone,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        tempMin: data.main.temp_min,
        tempMax: data.main.temp_max,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        visibility: data.visibility,
        sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
        sunset: new Date(data.sys.sunset * 1000).toISOString(),
      };
    },

    forecast: async (_, { city }) => {
      if (!CITIES.includes(city)) {
        throw new GraphQLError('City not found', {
          extensions: { code: 'CITY_NOT_FOUND' },
        });
      }
      const data = await fetchOWM('forecast', city);
      return {
        city: data.city.name,
        country: data.city.country,
        population: data.city.population ?? null,
        days: groupByDay(data.list, data.city.timezone),
      };
    },
  },
};
