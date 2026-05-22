import { gql } from 'apollo-server-micro';

export const typeDefs = gql`
  type CurrentWeather {
    city: String!
    country: String!
    datetime: String!
    timezone: Int!
    temperature: Float!
    feelsLike: Float!
    tempMin: Float!
    tempMax: Float!
    humidity: Int!
    description: String!
    icon: String!
    windSpeed: Float!
    visibility: Int!
    sunrise: String!
    sunset: String!
  }

  type ForecastItem {
    datetime: String!
    temperature: Float!
    feelsLike: Float!
    tempMin: Float!
    tempMax: Float!
    humidity: Int!
    description: String!
    icon: String!
    windSpeed: Float!
  }

  type DayForecast {
    date: String!
    items: [ForecastItem!]!
  }

  type Forecast {
    city: String!
    country: String!
    population: Int
    days: [DayForecast!]!
  }

  type Query {
    currentWeather(city: String!): CurrentWeather!
    forecast(city: String!): Forecast!
  }
`;
