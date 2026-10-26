import { expect, test } from '@playwright/test';

const widths = [320, 375, 768, 1023, 1024, 1440, 1920, 2560];

test.describe('адаптив', () => {
  test.skip(({ isMobile }) => isMobile, 'ширины перебираются в desktop-проекте');

  for (const width of widths) {
    test(`нет горизонтального скролла на ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('размер заголовка совпадает с макетами на 375 и 1920', async ({ page }) => {
    const fontSize = () =>
      page.locator('h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    expect(await fontSize()).toBeCloseTo(32, 0);

    await page.setViewportSize({ width: 1920, height: 1080 });
    expect(await fontSize()).toBeCloseTo(64, 0);
  });

  test('шрифт растёт плавно, без скачков на брейкпоинтах', async ({ page }) => {
    await page.goto('/');
    let previous = 0;
    for (let width = 320; width <= 1920; width += 50) {
      await page.setViewportSize({ width, height: 900 });
      const size = await page
        .locator('h1')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(size).toBeGreaterThanOrEqual(previous - 0.01);
      expect(size - previous).toBeLessThan(previous === 0 ? Infinity : 4);
      previous = size;
    }
  });

  for (const [width, height] of [
    [375, 812],
    [1440, 900],
    [1920, 1080],
  ]) {
    test(`первый экран — 90% высоты окна на ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const bottom = await page
        .getByTestId('hero')
        .evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
      expect(Math.abs(bottom - height * 0.9)).toBeLessThan(2);
    });
  }
});
