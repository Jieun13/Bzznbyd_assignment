import Image from 'next/image';
import Layout from '../components/Layout/Layout';
import CityButton from '../components/CityButton/CityButton';
import styles from '../styles/Home.module.css';
import { CITIES } from '../lib/constants';

export default function Home() {
  return (
    <Layout>
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>
            <span className={styles.titleBlack}>Welcome to</span>
            <span className={styles.titlePink}>Weather App!</span>
          </h1>
          <p className={styles.subtitle}>Choose a city from the list below to check the weather.</p>
          <nav className={styles.btnGroup}>
            {CITIES.map((city) => (
              <CityButton key={city} city={city} />
            ))}
          </nav>
        </section>
        <div className={styles.globeWrap}>
          <Image src="/earth-icon.png" alt="earth" width={430} height={321} priority />
        </div>
      </main>
    </Layout>
  );
}
