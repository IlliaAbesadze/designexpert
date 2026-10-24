import { describe, expect, it } from 'vitest';
import { getMotionMode } from '../../src/scripts/modules/env.js';

const fakeWindow = (reduce) => ({ matchMedia: () => ({ matches: reduce }) });

describe('getMotionMode()', () => {
  it('reduced при prefers-reduced-motion: reduce', () => {
    expect(getMotionMode(fakeWindow(true))).toBe('reduced');
  });

  it('full по умолчанию', () => {
    expect(getMotionMode(fakeWindow(false))).toBe('full');
    expect(getMotionMode({})).toBe('full');
  });
});
