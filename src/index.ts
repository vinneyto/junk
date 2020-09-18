import { routes } from './routes';
import { Demo } from './demo/Demo';
import { injectStyles } from './styles';
import Stats from 'stats.js';

injectStyles();

choseDemo();

async function choseDemo() {
  const demoName = new URLSearchParams(window.location.search).get('demo');

  if (demoName === null) {
    buildStartPage();
  } else {
    const info = routes.get(demoName);

    if (info === undefined) {
      const msg = 'demo is not found';
      alert(msg);
      throw new Error(msg);
    }

    const demo = await info.demo();

    start(demo);
  }
}

function start(demo: Demo) {
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  const render = () => {
    stats.begin();

    demo.render();

    stats.end();

    requestAnimationFrame(render);
  };

  render();
}

function buildStartPage() {
  const demosCont = document.createElement('div');
  demosCont.className = 'demo-list';
  document.body.appendChild(demosCont);

  for (const [routeName, routeInfo] of routes) {
    const { title, authors, tags } = routeInfo;

    const routeCont = document.createElement('a');
    routeCont.className = 'route-cont';
    routeCont.href = `/?demo=${routeName}`;
    demosCont.appendChild(routeCont);

    const titleCont = document.createElement('div');
    titleCont.innerHTML = title;
    titleCont.className = 'route-title';
    routeCont.appendChild(titleCont);

    const authorsList = document.createElement('div');
    authorsList.innerHTML = `Made by ${authors}`;
    authorsList.className = 'route-authors';
    routeCont.appendChild(authorsList);

    if (tags !== undefined) {
      const tagsList = document.createElement('div');
      tagsList.className = 'route-tags';
      tags.forEach((tag) => {
        const tagCont = document.createElement('div');
        tagCont.innerHTML = tag;
        tagsList.appendChild(tagCont);
      });
      routeCont.appendChild(tagsList);
    }
  }
  const footer = document.createElement('a');
  footer.className = 'footer';
  footer.href = 'https://github.com/vinneyto/three-shader';
  footer.target = '__blank';

  const githubIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0, 0, 439, 439">
        <path d = "M409 115a218 218 0 0 0-300-80 218 218 0 0 0-67 319c28 38 64 64 108 79 5 1 9 0 11-2 3-3 4-5 4-9a6590 6590 0 0 0 0-41l-7 2-16 1-20-2c-6-2-13-5-19-9-6-5-10-10-12-18l-3-6-9-15c-4-5-8-9-12-11l-2-1a21 21 0 0 1-7-7c0-2 0-3 2-4l8-1 6 1 14 7c5 4 10 8 14 15s9 13 15 17c7 4 13 7 19 7l16-2 13-4c2-13 7-23 14-30-11-1-20-2-29-5-9-2-18-6-27-11a77 77 0 0 1-38-49c-4-12-6-27-6-43 0-23 8-42 23-59-7-17-6-36 2-58 5-2 14 0 24 4a172 172 0 0 1 36 19 202 202 0 0 1 110 0l11-7c7-5 16-9 26-13s18-5 23-3c9 22 10 41 3 58 15 17 22 36 22 59 0 16-2 31-6 43-4 13-9 23-15 30-6 8-14 14-23 19s-18 9-27 11c-8 3-18 4-29 5 10 9 15 22 15 41v60c0 4 1 6 3 9 3 2 7 3 12 2 44-15 80-41 108-79 28-39 42-82 42-129 0-40-10-77-30-110z" />
      </svg>`;
  footer.innerHTML = githubIcon + '<div>source code</div>';
  document.body.appendChild(footer);
}
