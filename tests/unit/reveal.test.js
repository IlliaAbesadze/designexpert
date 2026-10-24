// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initReveal } from '../../src/scripts/modules/reveal.js';

let observerCallback;
const observed = new Set();

class FakeObserver {
  constructor(callback) {
    observerCallback = callback;
  }
  observe(el) {
    observed.add(el);
  }
  unobserve(el) {
    observed.delete(el);
  }
  disconnect() {
    observed.clear();
  }
}

const rect = (top) => ({ top, bottom: top + 100 });

describe('initReveal()', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    vi.stubGlobal('innerHeight', 800);
    document.body.innerHTML = `
      <div id="a" data-anim="fade-up"></div>
      <div id="b" data-line></div>
      <div id="c" data-anim="fade"></div>`;
    document.getElementById('a').getBoundingClientRect = () => rect(100);
    document.getElementById('b').getBoundingClientRect = () => rect(1200);
    document.getElementById('c').getBoundingClientRect = () => rect(1400);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    observed.clear();
    document.documentElement.className = '';
  });

  it('ставит motion-ready и сразу показывает то, что уже на экране', () => {
    initReveal(document);
    expect(document.documentElement.classList.contains('motion-ready')).toBe(true);
    expect(document.getElementById('a').classList.contains('is-inview')).toBe(true);
    expect([...observed].map((el) => el.id)).toEqual(['b', 'c']);
  });

  it('показывает элементы при входе в экран с каскадной задержкой', () => {
    initReveal(document, { stagger: 100 });
    const b = document.getElementById('b');
    const c = document.getElementById('c');
    observerCallback([
      { isIntersecting: true, target: b },
      { isIntersecting: true, target: c },
    ]);
    expect(b.classList.contains('is-inview')).toBe(true);
    expect(c.style.getPropertyValue('--reveal-delay')).toBe('100ms');
    expect(observed.size).toBe(0);
  });

  it('в reduced-режиме ничего не скрывает', () => {
    initReveal(document, { mode: 'reduced' });
    expect(document.documentElement.classList.contains('motion-ready')).toBe(false);
    expect(observed.size).toBe(0);
  });

  it('destroy снимает наблюдатель и класс', () => {
    const destroy = initReveal(document);
    destroy();
    expect(document.documentElement.classList.contains('motion-ready')).toBe(false);
    expect(observed.size).toBe(0);
  });
});
