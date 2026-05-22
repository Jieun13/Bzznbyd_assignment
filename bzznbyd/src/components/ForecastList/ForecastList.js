import { useState } from 'react';
import ForecastItem from './ForecastItem';
import styles from './ForecastList.module.css';

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export default function ForecastList({ days, timezone }) {
  const [openDate, setOpenDate] = useState(null);

  if (!days?.length) return null;

  function toggle(date) {
    setOpenDate((prev) => (prev === date ? null : date));
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>5-day Forecast</h2>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {days.map((day, idx) => {
          const isOpen = openDate === day.date;
          const isLast = idx === days.length - 1;
          return (
            <li key={day.date}>
              <button
                type="button"
                className={`${styles.dayRow}${isLast && !isOpen ? ` ${styles.dayRowLast}` : ''}${isOpen ? ` ${styles.dayRowOpen}` : ''}`}
                onClick={() => toggle(day.date)}
                aria-expanded={isOpen}
              >
                <span className={styles.dayLabel}>{formatDate(day.date)}</span>
                <span className={styles.chevron}>
                  <img src={isOpen ? '/chevron-up.png' : '/chevron-down.png'} alt="" aria-hidden="true" />
                </span>
              </button>
              {isOpen && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {day.items.map((item) => (
                    <ForecastItem key={item.datetime} data={item} timezone={timezone} />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
