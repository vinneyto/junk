import { GLTFRoot, GLTF } from './types';

export async function fetchGLTF(url: string): Promise<GLTF> {
  const root: GLTFRoot = await fetch(url).then((result) => result.json());
  const dir = dirName(url);

  const buffers = await Promise.all(
    (root.buffers || [])
      .filter((b) => b.uri !== undefined)
      .map((b) => fetchBuffer(`${dir}/${b.uri}`))
  );

  const images = await Promise.all(
    (root.images || [])
      .filter((i) => i.uri !== undefined)
      .map((i) => fetchImage(`${dir}/${i.uri}`))
  );

  return { root, buffers, images };
}

function dirName(url: string) {
  return url.split('/').slice(0, -1).join('/');
}

async function fetchBuffer(url: string) {
  return fetch(url).then((result) => result.arrayBuffer());
}

function fetchImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}
