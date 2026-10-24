# Изображения из Figma

Файл: [Design.expert](https://www.figma.com/design/Af4XTIIj9JbyF9TTeTvOEQ/Design.expert) ·
десктоп `1069:143` · мобайл `1149:8`.

Изображения выгружены рендером узлов через Figma MCP (`get_screenshot`) в разрешении макета (1×):
фото — WebP q85, обложки кейсов и фото выступлений обрезаны до слота (880×600 / 880×520),
логотипы — PNG. Для ретины стоит заменить на экспорт 2× из Figma (пути те же). Проверка: `npm run check:assets`
(в production-сборке Netlify отсутствующие файлы ломают деплой).

Формат: WebP/AVIF для фото, PNG/SVG для логотипов. Размер — 2× от слота в макете.

| Путь в `public/`                          | Слот в макете (desktop / mobile)         | Узел Figma             |
| ----------------------------------------- | ---------------------------------------- | ---------------------- |
| `images/cases/sensus.webp`                | case-card 880×600 / 343×320              | `I1339:97;1295:223`    |
| `images/cases/billine.webp`               | case-card 880×600 / 343×320              | `I1339:103;1295:223`   |
| `images/services.webp`                    | services\_\_image 440×440 / 344×240      | `1069:237`, `1149:126` |
| `images/portrait.webp`                    | work-formats\_\_image 900×1024 / 343×458 | `1069:333`, `1149:145` |
| `images/media/design-systems-meetup.webp` | media-card 880×520 / 343×320             | `I1339:294;1295:292`   |
| `images/media/podcast.webp`               | media-card 880×520 / 343×320             | `I1339:302;1295:292`   |
| `images/tools/hotjar.png`                 | tool-badge logo 20×24                    | `1342:4`               |
| `images/tools/clarity.png`                | 22×24                                    | `1342:7`               |
| `images/tools/sheets.png`                 | 18×24                                    | `1342:10`              |
| `images/tools/excel.png`                  | 26×24                                    | `1342:13`              |
| `images/tools/cursor.png`                 | 30×30                                    | `1342:16`              |
| `images/tools/claude.png`                 | 24×26                                    | `1342:19`              |
| `images/tools/chatgpt.png`                | 32×32                                    | `1342:22`              |
| `images/tools/vue.png`                    | 30×25                                    | `1342:25`              |
| `images/tools/react.png`                  | 30×26                                    | `1342:28`              |
| `images/tools/javascript.png`             | 24×24                                    | `1342:31`              |
| `images/tools/vscode.png`                 | 28×27                                    | `1342:34`              |
