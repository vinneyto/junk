import { dirName, fetchBuffer, fetchImage } from '../util';
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
