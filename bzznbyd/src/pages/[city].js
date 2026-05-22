import { useQuery } from '@apollo/client/react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Layout from '../components/Layout/Layout';
import styles from '../styles/City.module.css';
import { CITIES } from '../lib/constants';
import { GET_CURRENT_WEATHER, GET_FORECAST } from '../lib/queries';

const CurrentWeather = dynamic(() => import('../components/CurrentWeather/CurrentWeather'));
const ForecastList = dynamic(() => import('../components/ForecastList/ForecastList'));

export default function CityPage({ city, initialCurrentWeather, initialForecast }) {
  const { data: weatherData } = useQuery(GET_CURRENT_WEATHER, { variables: { city } });
  const { data: forecastData } = useQuery(GET_FORECAST, { variables: { city } });

  const currentWeather = weatherData?.currentWeather ?? initialCurrentWeather;
  const forecast = forecastData?.forecast ?? initialForecast;

  if (!currentWeather || !forecast) return null;

  return (
    <Layout>
      <main className={styles.page}>
        <header className={styles.header}>
          <Image src="/earth-icon.png" alt="earth" width={68} height={51} priority />
          <h1 className={styles.title}>Weather Information for {currentWeather.city}</h1>
        </header>
        <CurrentWeather data={currentWeather} population={forecast.population} />
        <ForecastList days={forecast.days} timezone={currentWeather.timezone} />
      </main>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  const { city } = params;
  if (!CITIES.includes(city)) return { notFound: true };

  try {
    const [{ typeDefs }, { resolvers }, { makeExecutableSchema }] = await Promise.all([
      import('../server/schema'),
      import('../server/resolvers'),
      import('@graphql-tools/schema'),
    ]);

    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const client = new ApolloClient({
      ssrMode: true,
      link: new SchemaLink({ schema }),
      cache: new InMemoryCache(),
    });

    const [weatherResult, forecastResult] = await Promise.all([
      client.query({ query: GET_CURRENT_WEATHER, variables: { city } }),
      client.query({ query: GET_FORECAST, variables: { city } }),
    ]);

    return {
      props: {
        city,
        initialApolloState: client.cache.extract(),
        initialCurrentWeather: weatherResult.data.currentWeather,
        initialForecast: forecastResult.data.forecast,
      },
    };
  } catch {
    return { notFound: true };
  }
}
