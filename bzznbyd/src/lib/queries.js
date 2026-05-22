import { gql } from '@apollo/client';

export const GET_CURRENT_WEATHER = gql`
  query GetCurrentWeather($city: String!) {
    currentWeather(city: $city) {
      city
      country
      datetime
      timezone
      temperature
      feelsLike
      tempMin
      tempMax
      humidity
      description
      icon
      windSpeed
      visibility
      sunrise
      sunset
    }
  }
`;

export const GET_FORECAST = gql`
  query GetForecast($city: String!) {
    forecast(city: $city) {
      city
      country
      population
      days {
        date
        items {
          datetime
          temperature
          feelsLike
          tempMin
          tempMax
          humidity
          description
          icon
          windSpeed
        }
      }
    }
  }
`;
