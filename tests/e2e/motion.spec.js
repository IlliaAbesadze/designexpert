import { expect, test } from '@playwright/test';

const viewportOffset = (page, ratio) => Math.round(page.viewportSize().height * ratio);

const hiddenAnimated = (page) =>
  page.evaluate(
    () =>
      [...document.querySelectorAll('[data-anim]')].filter(
        (el) =>
          Number(getComputedStyle(el).opacity) < 1 || getComputedStyle(el).clipPath !== 'none',
      ).length,
  );

test.describe('@motion появления', () => {
  test('элементы ниже экрана скрыты и появляются при скролле', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/motion-ready/);

    const card = page.getByTestId('price-card').first();
    await expect(card).not.toHaveClass(/is-inview/);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveClass(/is-inview/);
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });

  test('линии списков привязаны к скроллу и укорачиваются обратно', async ({ page }) => {
    await page.goto('/');
    const scale = (i) =>
      page
        .getByTestId('letter-row')
        .nth(i)
        .evaluate((el) => new DOMMatrix(getComputedStyle(el, '::after').transform).a);
    // Ставим список так, чтобы его верх был на 300px от верха экрана
    const placeList = (offset) =>
      page.evaluate((offset) => {
        const list = document.querySelector('.feedback__list');
        const top = list.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'instant' });
      }, offset);

    await placeList(viewportOffset(page, 0.3));
    await expect.poll(() => scale(0)).toBeCloseTo(1, 1);
    const lower = await scale(4);
    expect(lower).toBeGreaterThan(0);
    expect(lower).toBeLessThan(1);

    // Скролл вверх — та же линия опускается по экрану и укорачивается
    await placeList(viewportOffset(page, 0.7));
    await expect.poll(() => scale(0)).toBeLessThan(1);
  });

  test('первый экран стоит на месте и растворяется при скролле', async ({ page }) => {
    await page.goto('/');
    const height = page.viewportSize().height;
    const state = () =>
      page.evaluate(() => {
        const hero = document.querySelector('.hero');
        const title = document.querySelector('.hero__title');
        return {
          opacity: Number(getComputedStyle(hero).opacity),
          top: title.getBoundingClientRect().top,
        };
      });
    const scrollTo = (top) =>
      page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), top);

    const start = await state();
    expect(start.opacity).toBe(1);

    await scrollTo(Math.round(height * 0.2));
    await expect.poll(async () => (await state()).opacity).toBeLessThan(0.5);
    expect(Math.abs((await state()).top - start.top)).toBeLessThan(2);

    await scrollTo(Math.round(height * 0.8));
    await expect.poll(async () => (await state()).opacity).toBe(0);
    expect(await page.locator('.hero').evaluate((el) => getComputedStyle(el).visibility)).toBe(
      'hidden',
    );
  });

  test('анимации не сдвигают вёрстку (CLS)', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    const cls = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let value = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) if (!entry.hadRecentInput) value += entry.value;
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(value), 300);
        }),
    );
    expect(cls).toBeLessThan(0.05);
  });

  test('аккордеон раскрывается плавно и не ломает эксклюзивность', async ({ page }) => {
    await page.goto('/');
    const items = page.getByTestId('service-item');
    const content = items.nth(1).locator('[data-js="accordion-content"]');

    await items.nth(0).locator('summary').click();
    await expect(items.nth(0)).toHaveAttribute('open', '');
    await items.nth(1).locator('summary').click();
    expect(await content.evaluate((el) => el.getAnimations().length)).toBeGreaterThan(0);
    await expect(items.nth(0)).not.toHaveAttribute('open');
    await expect(items.nth(1)).toHaveAttribute('open', '');
  });
});

test.describe('@motion reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('контент виден сразу, движок не включается', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }));
    expect(await page.locator('.hero').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('html')).not.toHaveClass(/motion-ready/);
    expect(await hiddenAnimated(page)).toBe(0);
  });
});

test.describe('@motion без JS', () => {
  test.use({ javaScriptEnabled: false });

  test('весь контент виден, аккордеоны работают нативно', async ({ page }) => {
    await page.goto('/');
    expect(await hiddenAnimated(page)).toBe(0);

    const item = page.getByTestId('experience-item').nth(2);
    await item.locator('summary').click();
    await expect(item).toHaveAttribute('open', '');
  });
});
