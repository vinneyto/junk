import { Demo } from '../Demo';
import whaleGltfSrc from './models/Duck.glb';
import grassTextureSrc from './textures/grass_texture.jpg';
import { Vector2 } from 'three';

export async function createWasmGltfDemo(): Promise<Demo> {
  const { GLTFRendererDemo } = await import('../../../wasm/pkg');

  const gltfData = await (await fetch(whaleGltfSrc)).arrayBuffer();
  const grassImage = await fetchImage(grassTextureSrc);

  const demo = new GLTFRendererDemo(
    new Uint8Array(gltfData),
    grassImage,
    Math.round(Math.random() * 100)
  );

  const onMouseDown = (e: MouseEvent | TouchEvent) => {
    const coords = new Vector2();
    if (e instanceof TouchEvent) {
      coords.set(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    } else {
      coords.set(e.clientX, e.clientY);
    }

    demo.start_interaction(coords.x, coords.y);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent | TouchEvent) => {
    const coords = new Vector2();
    if (e instanceof TouchEvent) {
      coords.set(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    } else {
      coords.set(e.clientX, e.clientY);
    }

    demo.interact(coords.x, coords.y);
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onMouseMove);
    document.removeEventListener('touchend', onMouseUp);
  };

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('touchstart', onMouseDown);

  const render = () => {
    demo.update();
  };

  return { render };
}

async function fetchImage(src: string): Promise<HTMLImageElement> {
  return new Promise((result) => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      result(image);
    };
  });
}
