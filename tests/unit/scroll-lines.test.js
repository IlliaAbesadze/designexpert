// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initScrollLines, lineProgress } from '../../src/scripts/modules/scroll-lines.js';

describe('lineProgress()', () => {
  it('0 у нижнего края экрана и ниже', () => {
    expect(lineProgress(900, 900)).toBe(0);
    expect(lineProgress(1200, 900)).toBe(0);
  });

  it('растёт к середине экрана', () => {
    expect(lineProgress(675, 900)).toBeCloseTo(0.5);
  });

  it('1 от середины экрана и выше', () => {
    expect(lineProgress(450, 900)).toBe(1);
    expect(lineProgress(-50, 900)).toBe(1);
  });
});

describe('initScrollLines()', () => {
  let observed;

  beforeEach(() => {
    observed = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe(el) {
          observed.push(el);
        }
        disconnect() {
          observed = [];
        }
      },
    );
    vi.stubGlobal('innerHeight', 900);
    vi.stubGlobal('requestAnimationFrame', (cb) => (cb(), 1));
    document.body.innerHTML = '<div data-line></div><div data-line="top"></div>';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = '';
  });

  it('не нужен, если браузер умеет animation-timeline', () => {
    vi.stubGlobal('CSS', { supports: () => true });
    initScrollLines(document);
    expect(observed).toHaveLength(0);
    expect(document.documentElement.classList.contains('has-scroll-lines')).toBe(false);
  });

  it('включается как фолбэк и наблюдает все линии', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    const destroy = initScrollLines(document);
    expect(observed).toHaveLength(2);
    expect(document.documentElement.classList.contains('has-scroll-lines')).toBe(true);
    destroy();
    expect(document.documentElement.classList.contains('has-scroll-lines')).toBe(false);
  });

  it('выключен в reduced-режиме', () => {
    vi.stubGlobal('CSS', { supports: () => false });
    initScrollLines(document, { mode: 'reduced' });
    expect(observed).toHaveLength(0);
  });
});
