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
  Material,
  IUniform,
  Shader,
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

export interface IChunks {
  [chunk: string]: { before?: string[]; after?: string[]; replace?: string[] };
}

export function patchShader(src: string, chunks: IChunks): string {
  let newSrc = src;

  const join = (strings: string[], before?: string, after?: string) =>
    [before, ...strings, after].filter((s) => s !== undefined).join('\n');

  const anchors = Object.keys(chunks);

  for (const anchor of anchors) {
    const chunk = chunks[anchor];

    if (chunk.before !== undefined) {
      newSrc = newSrc.replace(anchor, join(chunk.before, undefined, anchor));
    }

    if (chunk.after !== undefined) {
      newSrc = newSrc.replace(anchor, join(chunk.after, anchor));
    }

    if (chunk.replace !== undefined) {
      newSrc = newSrc.replace(anchor, join(chunk.replace));
    }
  }

  return newSrc;
}

export function patchMaterial(
  material: Material,
  {
    fragment,
    vertex,
    uniforms,
    debugBefore,
    debugAfter,
  }: {
    fragment?: IChunks;
    vertex?: IChunks;
    uniforms?: Record<string, IUniform>;
    debugBefore?: boolean;
    debugAfter?: boolean;
  }
) {
  const oldOnBeforeCompile = material.onBeforeCompile;

  material.onBeforeCompile = (shader: Shader, renderer: WebGLRenderer) => {
    oldOnBeforeCompile.call(material, shader, renderer);

    if (uniforms !== undefined) {
      Object.assign(shader.uniforms, uniforms);
    }

    if (vertex !== undefined) {
      if (debugBefore) {
        console.warn('--- Vertex shader before ---\n', shader.vertexShader);
      }

      shader.vertexShader = patchShader(shader.vertexShader, vertex);

      if (debugAfter) {
        console.warn('--- Vertex shader after ---\n', shader.vertexShader);
      }
    }

    if (fragment !== undefined) {
      if (debugBefore) {
        console.warn('--- Fragment shader before ---\n', shader.fragmentShader);
      }

      shader.fragmentShader = patchShader(shader.fragmentShader, fragment);

      if (debugAfter) {
        console.warn('--- Fragment shader after ---\n', shader.fragmentShader);
      }
    }
  };
}
