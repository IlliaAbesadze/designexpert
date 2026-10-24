import { resolve } from 'node:path';
import { compileString } from 'sass';
import { describe, expect, it } from 'vitest';

const loadPaths = [resolve(import.meta.dirname, '../../src/styles')];

/** Компилирует выражение через абстракции проекта и возвращает значение свойства. */
const evaluate = (expression) => {
  const { css } = compileString(`@use 'abstracts' as *;\n.t { v: ${expression}; }`, {
    loadPaths,
  });
  return css.match(/v: (.+);/)[1];
};

/** Считает значение clamp(min, a rem + b vw, max) или статичного rem на ширине вьюпорта, в px. */
const resolveAt = (clampValue, viewport) => {
  if (/^[-\d.]+rem$/.test(clampValue)) return parseFloat(clampValue) * 16;
  const [, min, base, slope, max] = clampValue.match(
    /clamp\(([-\d.]+)rem, ([-\d.]+)rem \+ ([-\d.]+)vw, ([-\d.]+)rem\)/,
  );
  const value = Number(base) * 16 + (Number(slope) * viewport) / 100;
  return Math.min(Math.max(value, Number(min) * 16), Number(max) * 16);
};

describe('rem()', () => {
  it('переводит px в rem', () => {
    expect(evaluate('rem(24)')).toBe('1.5rem');
    expect(evaluate('rem(24px)')).toBe('1.5rem');
  });
});

describe('fluid()', () => {
  it('попадает в крайние точки диапазона', () => {
    const value = evaluate('fluid(32, 64, 375, 1920)');
    expect(resolveAt(value, 375)).toBeCloseTo(32, 1);
    expect(resolveAt(value, 1920)).toBeCloseTo(64, 1);
  });

  it('ограничивает значение за пределами диапазона', () => {
    const value = evaluate('fluid(32, 64, 375, 1920)');
    expect(resolveAt(value, 320)).toBeCloseTo(32, 1);
    expect(resolveAt(value, 2560)).toBeCloseTo(64, 1);
  });

  it('поддерживает уменьшающиеся значения', () => {
    const value = evaluate('fluid(40, 20, 375, 1920)');
    expect(resolveAt(value, 375)).toBeCloseTo(40, 1);
    expect(resolveAt(value, 1920)).toBeCloseTo(20, 1);
  });

  it('возвращает статичный rem при равных значениях', () => {
    expect(evaluate('fluid(16, 16)')).toBe('1rem');
  });

  it('падает при перепутанных вьюпортах', () => {
    expect(() => evaluate('fluid(10, 20, 1920, 375)')).toThrow(/\$vp-min/);
  });
});

describe('fluid-m() / fluid-d()', () => {
  it('fluid-m даёт значение мобильного макета на 375', () => {
    expect(resolveAt(evaluate('fluid-m(32, 64)'), 375)).toBeCloseTo(32, 1);
  });

  it('fluid-d даёт значение десктопного макета на 1920', () => {
    expect(resolveAt(evaluate('fluid-d(64, 32)'), 1920)).toBeCloseTo(64, 1);
  });

  it('нет скачка на стыке раскладок 1023 → 1024', () => {
    for (const [mobile, desktop] of [
      [32, 64],
      [120, 180],
      [16, 60],
      [12, 14],
    ]) {
      const atMobileEnd = resolveAt(evaluate(`fluid-m(${mobile}, ${desktop})`), 1023);
      const atDesktopStart = resolveAt(evaluate(`fluid-d(${desktop}, ${mobile})`), 1024);
      expect(Math.abs(atMobileEnd - atDesktopStart)).toBeLessThan(0.5);
    }
  });
});

describe('space()', () => {
  it('возвращает токен из шкалы', () => {
    expect(evaluate('space(28)')).toBe('28');
  });

  it('падает на несуществующем токене', () => {
    expect(() => evaluate('space(13)')).toThrow(/spacing-13/);
  });
});
