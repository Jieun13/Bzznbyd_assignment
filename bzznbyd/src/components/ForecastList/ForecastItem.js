import styles from './ForecastList.module.css';
import { formatTime } from '../../lib/formatTime';

export default function ForecastItem({ data, timezone }) {
  if (!data) return null;

  return (
    <li className={styles.itemRow}>
      <div className={styles.itemLeft}>
        <div className={styles.itemIconCircle}>
          <img
            src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
            alt={data.description}
            className={styles.itemIconImg}
          />
        </div>
        <span className={styles.itemTime}>{formatTime(data.datetime, timezone)}</span>
      </div>
      <div className={styles.itemRight}>
        <span className={styles.itemDesc}>{data.description}</span>
        <span className={styles.itemTemp}>
          {data.tempMin.toFixed(2)}℃ / {data.tempMax.toFixed(2)}℃
        </span>
      </div>
    </li>
  );
}
