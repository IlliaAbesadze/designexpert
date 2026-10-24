const SELECTOR = '[data-line]';
const ROOT_CLASS = 'has-scroll-lines';

/**
 * Прогресс линии 0…1 по её положению в экране: 0 у нижнего края,
 * 1 — когда линия поднялась до середины экрана (как animation-range
 * `cover 0% cover 50%` в CSS).
 * @param {number} lineY — координата линии относительно вьюпорта
 * @param {number} viewportHeight
 */
export function lineProgress(lineY, viewportHeight) {
  const progress = (viewportHeight - lineY) / (viewportHeight / 2);
  return Math.min(Math.max(progress, 0), 1);
}

/**
 * Фолбэк для браузеров без CSS scroll-driven animations.
 * Один пассивный scroll-слушатель, расчёт в requestAnimationFrame
 * и только для линий рядом с экраном (IntersectionObserver).
 *
 * @param {Document} doc
 * @param {{ mode?: 'full' | 'reduced' }} options
 * @returns {() => void} destroy
 */
export function initScrollLines(doc = document, { mode = 'full' } = {}) {
  const noop = () => {};
  const supportsCss = window.CSS?.supports?.('animation-timeline: view()');
  const lines = [...doc.querySelectorAll(SELECTOR)];
  if (mode !== 'full' || supportsCss || lines.length === 0 || !('IntersectionObserver' in window)) {
    return noop;
  }

  const active = new Set();
  let frame = 0;

  const update = () => {
    frame = 0;
    const viewportHeight = window.innerHeight;
    active.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const y = el.dataset.line === 'top' ? rect.top : rect.bottom;
      el.style.setProperty('--line-progress', lineProgress(y, viewportHeight).toFixed(3));
    });
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) active.add(target);
        else {
          active.delete(target);
          // Ушла вниз — пустая, ушла вверх — полная
          const below = target.getBoundingClientRect().top > window.innerHeight;
          target.style.setProperty('--line-progress', below ? '0' : '1');
        }
      });
      schedule();
    },
    { rootMargin: '20% 0px' },
  );

  lines.forEach((el) => observer.observe(el));
  doc.documentElement.classList.add(ROOT_CLASS);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();

  return () => {
    observer.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (frame) cancelAnimationFrame(frame);
    doc.documentElement.classList.remove(ROOT_CLASS);
  };
}
