/**
 * Прогрессивное улучшение меню на Popover API:
 * открытие, закрытие по Esc и клику мимо работают без JS,
 * здесь только закрываем меню после перехода по якорю.
 * @param {ParentNode} root
 * @returns {(() => void) | null} функция отписки
 */
export function initMenu(root = document) {
  const menu = root.querySelector('[data-js="menu"]');
  if (!menu || typeof menu.hidePopover !== 'function') return null;

  const onClick = (event) => {
    if (event.target.closest('[data-js="menu-link"]')) menu.hidePopover();
  };

  menu.addEventListener('click', onClick);
  return () => menu.removeEventListener('click', onClick);
}
