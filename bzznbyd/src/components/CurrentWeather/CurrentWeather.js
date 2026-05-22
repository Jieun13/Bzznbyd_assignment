import styles from './CurrentWeather.module.css';
import { formatDateTime } from '../../lib/formatTime';

export default function CurrentWeather({ data, population }) {
  if (!data) return null;

  return (
    <section className={styles.card}>
      <div className={styles.left}>
        <div className={styles.iconCircle}>
          <img
            src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
            alt={data.description}
            className={styles.iconImg}
          />
        </div>
        <div className={styles.info}>
          <span className={styles.datetime}>{formatDateTime(data.datetime, data.timezone)}</span>
          <div className={styles.cityRow}>
            <span className={styles.cityName}>{data.city}, {data.country}</span>
            {population != null && (
              <span className={styles.population}>(인구수 : {population.toLocaleString()})</span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.right}>
        <span className={styles.temperature}>{data.temperature.toFixed(2)}℃</span>
        <span className={styles.details}>
          Feels like {data.feelsLike.toFixed(2)}℃&nbsp;&nbsp;{data.description}&nbsp;&nbsp;풍속 {data.windSpeed}m/s&nbsp;&nbsp;습도 {data.humidity}%
        </span>
      </div>
    </section>
  );
}
