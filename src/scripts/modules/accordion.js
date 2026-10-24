import { getDuration, getEasing } from './env.js';

const CLOSING_CLASS = 'is-closing';

/**
 * Плавное раскрытие <details>-аккордеонов по высоте (Web Animations API).
 * Без JS работает нативный <details name>; здесь эксклюзивность группы
 * берём на себя (атрибут name переносим в data-group), чтобы соседний
 * пункт тоже закрывался анимацией, а не мгновенно.
 *
 * @param {ParentNode} root
 * @param {{ mode?: 'full' | 'reduced' }} options
 * @returns {() => void} destroy
 */
export function initAccordions(root = document, { mode = 'full' } = {}) {
  const items = [...root.querySelectorAll('[data-js="accordion-item"]')];
  if (mode !== 'full' || items.length === 0 || typeof Element.prototype.animate !== 'function') {
    return () => {};
  }

  const duration = getDuration('base', 450);
  const easing = getEasing('out');
  const running = new WeakMap();

  const getContent = (item) => item.querySelector('[data-js="accordion-content"]');

  const animateHeight = (item, from, to, onFinish) => {
    running.get(item)?.cancel();
    const content = getContent(item);
    const animation = content.animate(
      [
        { height: `${from}px`, opacity: from === 0 ? 0 : 1 },
        { height: `${to}px`, opacity: to === 0 ? 0 : 1 },
      ],
      { duration, easing },
    );
    running.set(item, animation);
    animation.onfinish = () => {
      running.delete(item);
      onFinish?.();
    };
    animation.oncancel = () => running.delete(item);
  };

  const close = (item) => {
    if (!item.open || item.classList.contains(CLOSING_CLASS)) return;
    item.classList.add(CLOSING_CLASS);
    const height = getContent(item).offsetHeight;
    animateHeight(item, height, 0, () => {
      item.open = false;
      item.classList.remove(CLOSING_CLASS);
    });
  };

  const open = (item) => {
    const group = item.dataset.group;
    if (group) {
      items
        .filter((other) => other !== item && other.dataset.group === group && other.open)
        .forEach(close);
    }
    item.classList.remove(CLOSING_CLASS);
    item.open = true;
    animateHeight(item, 0, getContent(item).offsetHeight);
  };

  const onClick = (event) => {
    const summary = event.target.closest('summary');
    const item = summary?.parentElement;
    if (!item || !items.includes(item)) return;
    event.preventDefault();
    if (item.open && !item.classList.contains(CLOSING_CLASS)) close(item);
    else open(item);
  };

  items.forEach((item) => {
    const name = item.getAttribute('name');
    if (name) {
      item.dataset.group = name;
      item.removeAttribute('name');
    }
  });
  root.addEventListener('click', onClick);

  return () => {
    root.removeEventListener('click', onClick);
    items.forEach((item) => {
      if (item.dataset.group) item.setAttribute('name', item.dataset.group);
    });
  };
}
