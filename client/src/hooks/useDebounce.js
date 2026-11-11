import { useState, useEffect } from 'react';

/**
 * Delays propagating rapid value changes until `delay` ms of inactivity.
 * Used to coalesce editor keystrokes before issuing persistence writes.
 *
 * @template T
 * @param {T} value
 * @param {number} [delay=500]
 * @returns {T}
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
