import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './CityButton.module.css';

export default function CityButton({ city }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const isActive = router.query.city === city;

  useEffect(() => {
    setPending(false);
  }, [router.asPath]);

  function handleClick() {
    setPending(true);
    router.push(`/${city}`);
  }

  return (
    <button
      type="button"
      className={`${styles.button}${isActive || pending ? ` ${styles.active}` : ''}`}
      onClick={handleClick}
    >
      {city}
    </button>
  );
}
