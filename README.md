# Design.expert

Одностраничный сайт-портфолио по макетам Figma
([desktop](https://www.figma.com/design/Af4XTIIj9JbyF9TTeTvOEQ/Design.expert?node-id=1069-143),
[mobile](https://www.figma.com/design/Af4XTIIj9JbyF9TTeTvOEQ/Design.expert?node-id=1149-8)).
HTML (Handlebars-партиалы) + SCSS + немного JS, сборка — Vite.

## Быстрый старт

```bash
nvm use          # Node 22
npm ci
npm run dev      # http://localhost:5173
```

| Команда                   | Что делает                                                      |
| ------------------------- | --------------------------------------------------------------- |
| `npm run dev`             | dev-сервер с перезагрузкой по изменениям партиалов и контента   |
| `npm run build`           | production-сборка в `dist/`                                     |
| `npm run preview`         | раздать `dist/` на :4173                                        |
| `npm run lint`            | Stylelint (БЭМ, без hex вне токенов) + ESLint + Prettier        |
| `npm run test:unit`       | Vitest: fluid-функции SCSS, JS-модули                           |
| `npm run test:e2e`        | Playwright: смоук, аккордеоны, меню, адаптив 320–2560, axe      |
| `npm run check`           | всё статическое + сборка + валидация HTML + наличие изображений |
| `npm run test:lighthouse` | Lighthouse CI с бюджетами (запускается в CI)                    |

## Структура

```
src/
  index.html             каркас страницы, подключает партиалы
  content/en.json        все тексты и ссылки — правим здесь, не в разметке
  partials/
    layout/              header (меню), footer (contacts)
    sections/            hero, experience, cases, services, knowledge, …
    components/          section-head, tool-badge, more-badge, link, toggle-icon
  styles/
    abstracts/           _config (вьюпорты, брейкпоинты), _functions (fluid), _mixins
    tokens/              _colors, _spacing, _typography → CSS-переменные в _root
    base/ layout/ components/ sections/
  scripts/               main.js + modules/
public/                  статика как есть (изображения, favicon, robots.txt)
build/                   Vite-плагин Handlebars, проверка изображений
tests/unit, tests/e2e
```

## Fluid-вёрстка

Макеты: мобайл 375, десктоп 1920. Раскладки: мобильная `< 1024`, десктопная `≥ 1024`.
Всё тянется плавно от 320 до 1920, выше 1920 значения не растут.

```scss
// Базовая функция: значения в px и вьюпорты, на выходе clamp()
font-size: fluid(32, 64, 375, 1920);

// Мобильный диапазон 320→1023: на 375 ровно значение мобильного макета
padding: fluid-m(16, 60);
// Десктопный диапазон 1024→1920: на 1920 ровно значение десктопного макета
padding: fluid-d(60, 16);

// Обе раскладки одной строкой (fluid-m + mq(desktop) { fluid-d })
@include adaptive(padding-bottom, 120, 180);

// Текстовый стиль из токенов (размер и интерлиньяж — тоже fluid)
@include text(title);
```

На стыке 1023/1024 значения сходятся (проверяется юнит-тестом), поэтому скачков нет.

## Токены

- **Цвета** — `tokens/_colors.scss`: примитивы из Figma (`black`, `white`, `gray-50…900`)
  и семантические роли (`text`, `text-muted`, `bg-inverse`, `border`, …).
  В компонентах используются только `var(--color-<роль>)`; hex вне токенов запрещён линтером.
- **Отступы** — `tokens/_spacing.scss`: шкала `spacing-*` из Figma, `space(28)` падает на
  сборке, если токена нет; CSS-переменные `--space-*`, ритм страницы `--gutter`,
  `--grid-gap`, `--section-space`.
- **Шрифты** — `tokens/_typography.scss`: Roboto Mono и Roboto (variable, self-hosted через
  Fontsource), текстовые стили `display`, `heading`, `title`, `lead`, `body`, `ui-caps`, …
  с парами размеров мобайл/десктоп из Figma.

## Интерактив без JS

- Аккордеоны «Experience» и «Services» — нативный `<details name>`: один раскрытый пункт,
  работает с клавиатуры и без скриптов.
- Меню — Popover API: открытие, Esc, клик мимо. JS только закрывает меню после перехода
  по якорю.
- Анимаций пока нет — точки входа будут добавляться через `data-anim`.

## Деплой

Netlify + GitHub (`netlify.toml`): `main` → production, `dev` → staging, PR → deploy preview.
Подключение: Netlify → Add new site → Import from GitHub → выбрать репозиторий
(настройки сборки подтянутся из `netlify.toml`). Защитите `main`: merge только через PR
с зелёным CI (`.github/workflows/ci.yml`: lint → unit → build → HTML → e2e/axe → Lighthouse).

## Открытые вопросы

См. `docs/handoff.md`.
