import '@fontsource-variable/roboto-mono';
import '@fontsource-variable/roboto';
import '../styles/main.scss';
import { initAccordions } from './modules/accordion.js';
import { getMotionMode } from './modules/env.js';
import { initMenu } from './modules/menu.js';
import { initReveal } from './modules/reveal.js';
import { initScrollLines } from './modules/scroll-lines.js';

const mode = getMotionMode();

initMenu(document);
initAccordions(document, { mode });
initReveal(document, { mode });
initScrollLines(document, { mode });
