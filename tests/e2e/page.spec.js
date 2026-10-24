import { expect, test } from '@playwright/test';

const sections = [
  'hero',
  'experience',
  'cases',
  'services',
  'knowledge',
  'work-formats',
  'feedback',
  'media',
  'contacts',
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('страница отдаёт мету и один h1', async ({ page }) => {
  await expect(page).toHaveTitle(/design services/i);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
});

test('все секции на месте', async ({ page }) => {
  for (const id of sections) {
    await expect(page.getByTestId(id)).toBeAttached();
  }
});

test('нет ошибок в консоли', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    // Изображения из Figma догружаются отдельно — их 404 не считаем ошибкой кода
    if (message.type() === 'error' && !message.text().includes('404')) errors.push(message.text());
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

test('аккордеоны по умолчанию закрыты', async ({ page }) => {
  for (const id of ['experience-item', 'service-item']) {
    await expect(page.locator(`[data-testid="${id}"][open]`)).toHaveCount(0);
  }
});

test('аккордеон опыта: открыт только один пункт', async ({ page }) => {
  const items = page.getByTestId('experience-item');
  await items.nth(0).locator('summary').click();
  await expect(items.nth(0)).toHaveAttribute('open', '');

  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open');
});

test('аккордеон услуг работает с клавиатуры', async ({ page }) => {
  const item = page.getByTestId('service-item').nth(2);
  await item.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(item).toHaveAttribute('open', '');
});

test('меню открывается, закрывается по Esc и после перехода по пункту', async ({ page }) => {
  const menu = page.getByTestId('menu');
  await expect(menu).toBeHidden();

  await page.getByTestId('menu-toggle').click();
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();

  await page.getByTestId('menu-toggle').click();
  await menu.getByRole('link', { name: 'Cases' }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#cases$/);
});
