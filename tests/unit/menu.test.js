// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initMenu } from '../../src/scripts/modules/menu.js';

describe('initMenu()', () => {
  let menu;

  beforeEach(() => {
    document.body.innerHTML = `
      <div data-js="menu" popover>
        <a href="#cases" data-js="menu-link">Cases</a>
        <p>text</p>
      </div>`;
    menu = document.querySelector('[data-js="menu"]');
    menu.hidePopover = vi.fn();
  });

  it('закрывает меню по клику на пункт', () => {
    initMenu(document);
    menu.querySelector('a').click();
    expect(menu.hidePopover).toHaveBeenCalledOnce();
  });

  it('не закрывает меню по клику мимо пунктов', () => {
    initMenu(document);
    menu.querySelector('p').click();
    expect(menu.hidePopover).not.toHaveBeenCalled();
  });

  it('снимает обработчик', () => {
    const destroy = initMenu(document);
    destroy();
    menu.querySelector('a').click();
    expect(menu.hidePopover).not.toHaveBeenCalled();
  });

  it('ничего не делает без Popover API', () => {
    delete menu.hidePopover;
    expect(initMenu(document)).toBeNull();
  });
});
