import { routes } from './routes';
import { Demo } from './demo/Demo';
import { injectStyles } from './styles';

injectStyles();

choseDemo();

async function choseDemo() {
  const demoName = new URLSearchParams(window.location.search).get('demo');

  if (demoName === null) {
    const cont = document.createElement('div');
    cont.className = 'demo-list';
    document.body.appendChild(cont);
    for (const routeName of routes.keys()) {
      const a = document.createElement('a');
      a.innerHTML = routeName;
      a.href = `/?demo=${routeName}`;
      cont.appendChild(a);
      cont.appendChild(document.createElement('br'));
    }
  } else {
    const createDemo = routes.get(demoName);

    if (createDemo === undefined) {
      const msg = 'demo is not found';
      alert(msg);
      throw new Error(msg);
    }

    const demo = await createDemo();

    start(demo);
  }
}

function start(demo: Demo) {
  const render = () => {
    demo.render();

    requestAnimationFrame(render);
  };

  render();
}
