import {
  WebGLRenderer,
  Color,
  PerspectiveCamera,
  Scene,
  Camera,
  Vector2,
  CubeTextureLoader,
  TextureLoader,
  Texture,
  CubeTexture,
} from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: true });
  document.body.appendChild(renderer.domElement);
  renderer.setClearColor(new Color('white'));
  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  renderer.render(new Scene(), new Camera());

  return renderer;
}

const sizeMap = new WeakMap<WebGLRenderer, Vector2>();

export function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
  const canvas = renderer.domElement;
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;

  let size = sizeMap.get(renderer);
  if (size === undefined) {
    size = new Vector2();
    sizeMap.set(renderer, size);
  }

  const newSizeX = width * window.devicePixelRatio;
  const newSizeY = height * window.devicePixelRatio;

  const needResize = newSizeX !== size.x || newSizeY !== size.y;
  if (needResize) {
    size.x = newSizeX;
    size.y = newSizeY;
    renderer.setSize(width, height, false);
  }
  return needResize;
}

export function resizePerspectiveCamera(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera
) {
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
}

export function resizeRenderer(
  renderer: WebGLRenderer,
  camera: PerspectiveCamera
) {
  if (resizeRendererToDisplaySize(renderer)) {
    resizePerspectiveCamera(renderer, camera);
    return true;
  }
  return false;
}

export async function fetchGLTF(url: string) {
  return new Promise<GLTF>((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => resolve(gltf),
      undefined,
      (e) => reject(e)
    );
  });
}

export async function fetchTexture(url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(url, resolve, undefined, reject);
  });
}

export async function fetchCubeTexture(urls: string[]): Promise<CubeTexture> {
  return new Promise((resolve, reject) => {
    new CubeTextureLoader().load(urls, resolve, undefined, reject);
  });
}
