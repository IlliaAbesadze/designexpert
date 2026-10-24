// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initAccordions } from '../../src/scripts/modules/accordion.js';

// jsdom не умеет WAAPI — эмулируем мгновенно завершающуюся анимацию
const animate = vi.fn(function () {
  const animation = { cancel: vi.fn(), onfinish: null, oncancel: null };
  queueMicrotask(() => animation.onfinish?.());
  return animation;
});

const markup = `
  <div>
    ${[0, 1]
      .map(
        (i) => `
      <details name="group" data-js="accordion-item" ${i === 0 ? 'open' : ''}>
        <summary>Item ${i}</summary>
        <div data-js="accordion-content"><p>Text</p></div>
      </details>`,
      )
      .join('')}
  </div>`;

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe('initAccordions()', () => {
  let destroy;

  beforeEach(() => {
    Element.prototype.animate = animate;
    document.body.innerHTML = markup;
  });

  afterEach(() => {
    destroy?.();
    delete Element.prototype.animate;
    animate.mockClear();
  });

  it('переносит name в data-group, чтобы управлять группой самому', () => {
    destroy = initAccordions(document);
    const [first] = document.querySelectorAll('details');
    expect(first.hasAttribute('name')).toBe(false);
    expect(first.dataset.group).toBe('group');
  });

  it('открывает пункт анимацией и закрывает соседа', async () => {
    destroy = initAccordions(document);
    const [first, second] = document.querySelectorAll('details');
    second.querySelector('summary').click();
    expect(second.open).toBe(true);
    expect(first.classList.contains('is-closing')).toBe(true);
    await flush();
    expect(first.open).toBe(false);
    expect(first.classList.contains('is-closing')).toBe(false);
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it('закрывает открытый пункт по повторному клику', async () => {
    destroy = initAccordions(document);
    const [first] = document.querySelectorAll('details');
    first.querySelector('summary').click();
    await flush();
    expect(first.open).toBe(false);
  });

  it('в reduced-режиме оставляет нативное поведение', () => {
    destroy = initAccordions(document, { mode: 'reduced' });
    expect(document.querySelector('details').getAttribute('name')).toBe('group');
    expect(animate).not.toHaveBeenCalled();
  });

  it('destroy возвращает атрибут name', () => {
    initAccordions(document)();
    expect(document.querySelector('details').getAttribute('name')).toBe('group');
  });
});
