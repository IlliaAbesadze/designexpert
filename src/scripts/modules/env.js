/**
 * Режим движения: 'full' или 'reduced' (prefers-reduced-motion: reduce).
 * @param {Window} win
 * @returns {'full' | 'reduced'}
 */
export function getMotionMode(win = window) {
  return win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'reduced' : 'full';
}

/**
 * Длительность из CSS-токена (--duration-*) в миллисекундах.
 * @param {string} name — имя токена без префикса, например 'base'
 * @param {number} fallback
 */
export function getDuration(name, fallback = 0) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--duration-${name}`);
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.trim().endsWith('ms') ? value : value * 1000;
}

/** Кривая из CSS-токена (--ease-*). */
export function getEasing(name, fallback = 'ease-out') {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(`--ease-${name}`);
  return raw.trim() || fallback;
}
