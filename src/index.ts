import { createRenderer, resizeRendererToDisplaySize } from './util';
import { routes } from './routes';
import { Demo } from './demo/Demo';

const demoName = new URLSearchParams(window.location.search).get('demo');

if (demoName === null) {
  for (const routeName of routes.keys()) {
    const a = document.createElement('a');
    a.innerHTML = routeName;
    a.href = `/?demo=${routeName}`;
    document.body.appendChild(a);
    document.body.appendChild(document.createElement('br'));
  }
} else {
  const createDemo = routes.get(demoName);

  if (createDemo === undefined) {
    const msg = 'demo is not found';
    alert(msg);
    throw new Error(msg);
  }

  start(createDemo);
}

function start(createDemo: () => Demo) {
  const demo = createDemo();

  const render = () => {
    demo.render();

    requestAnimationFrame(render);
  };

  render();
}
