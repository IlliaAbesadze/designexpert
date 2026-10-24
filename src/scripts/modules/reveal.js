const SELECTOR = '[data-anim]';
const READY_CLASS = 'motion-ready';
const INVIEW_CLASS = 'is-inview';
const MAX_STAGGER_STEPS = 6;

/**
 * Появления при скролле (линии списков — scroll-lines.js и CSS).
 * Ставит .motion-ready на <html> (включает стартовые состояния в CSS)
 * и .is-inview на элементы, когда они входят в экран. Один общий
 * IntersectionObserver, каждый элемент анимируется один раз.
 * Соседи, вошедшие в экран одновременно, получают каскадную задержку.
 *
 * @param {Document} doc
 * @param {{ mode?: 'full' | 'reduced', stagger?: number }} options
 * @returns {() => void} destroy
 */
export function initReveal(doc = document, { mode = 'full', stagger = 90 } = {}) {
  const root = doc.documentElement;
  const elements = [...doc.querySelectorAll(SELECTOR)];
  const noop = () => {};

  if (mode !== 'full' || !('IntersectionObserver' in window) || elements.length === 0) {
    return noop;
  }

  const show = (el, delay = 0) => {
    if (delay > 0) el.style.setProperty('--reveal-delay', `${delay}ms`);
    el.classList.add(INVIEW_CLASS);
  };

  // Что уже на экране в момент запуска — показываем сразу, без мигания
  const viewportHeight = window.innerHeight;
  const pending = elements.filter((el) => {
    const { top, bottom } = el.getBoundingClientRect();
    const visible = top < viewportHeight && bottom > 0;
    if (visible) el.classList.add(INVIEW_CLASS);
    return !visible;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const entering = entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target);
      entering.forEach((el, index) => {
        show(el, Math.min(index, MAX_STAGGER_STEPS) * stagger);
        observer.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0 },
  );

  pending.forEach((el) => observer.observe(el));
  root.classList.add(READY_CLASS);

  return () => {
    observer.disconnect();
    root.classList.remove(READY_CLASS);
  };
}
