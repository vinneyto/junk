import resetCss from './reset.css';
import mainCss from './main.css';

export function injectStyles() {
  style(resetCss);
  style(mainCss);
}

export function style(css: string) {
  const style = document.createElement('style');
  style.type = 'text/css';

  document.head.appendChild(style);
  style.appendChild(document.createTextNode(css));
}
