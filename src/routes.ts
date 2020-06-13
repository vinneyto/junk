import { createBoxDemo } from './demo/createBoxDemo';
import { Demo } from './demo/Demo';
import { useSingleColorShaderMaterial as natalyjSingleColorShaderMaterial } from './demo/natalyj-demo/SingleColorShaderMaterial/useSingleColorShaderMaterial';
import { useSplitColorShaderMaterial as natalyjSplitColorShaderMaterial } from './demo/natalyj-demo/SplitColorShaderMaterial/useSplitColorShaderMaterial';
import { createWasmDemoFactory } from './demo/createWasmDemoFactory';
import { useScanner as natalyjScanner } from './demo/natalyj-demo/Scanner/useScanner';
import { createPhysicsDemo } from './demo/vinneyto-demo/createPhysicsDemo';
import { drawTriangle as natalyjDrawTriangle } from './demo/natalyj-demo/Triangle/drawTriangle';
import { createWasmGltfDemo as vinneytoWasmGltfDemo } from './demo/vinneyto-demo/createWasmGltfDemo';
import { createCameraDemo as vinneytoCreateCameraDemo } from './demo/vinneyto-demo/createCameraDemo';

interface RouteInfo {
  demo: () => Promise<Demo>;
  title: string;
  authors: string;
  tags?: string[];
}

const vinneytoWasmTriangleDemo = createWasmDemoFactory('TriangleDemo');
const vinneytoWasmSkinningDemo = createWasmDemoFactory('SkinningDemo');

export const routes = new Map<string, RouteInfo>();
routes.set('box', {
  demo: createBoxDemo,
  title: 'Box',
  authors: 'vinneyto',
  tags: ['threejs', 'typescript'],
});
routes.set('natalyj-singleColorShaderMaterial', {
  demo: natalyjSingleColorShaderMaterial,
  title: 'Single Color Shader Material',
  authors: 'natalyj',
  tags: ['threejs', 'typescript'],
});
routes.set('natalyj-splitColorShaderMaterial', {
  demo: natalyjSplitColorShaderMaterial,
  title: 'Split Color Shader Material',
  authors: 'natalyj, vinneyto',
  tags: ['threejs', 'typescript'],
});
routes.set('vinneyto-wasm-webgl2-triangle', {
  demo: vinneytoWasmTriangleDemo,
  title: 'WebGL2 Triangle',
  authors: 'vinneyto',
  tags: ['wasm', 'rust', 'webgl2'],
});
routes.set('vinneyto-wasm-skinning', {
  demo: vinneytoWasmSkinningDemo,
  title: 'Skinning',
  authors: 'vinneyto',
  tags: ['wasm', 'rust', 'webgl'],
});
routes.set('natalyj-scanner', {
  demo: natalyjScanner,
  title: 'Scanner',
  authors: 'natalyj, vinneyto',
  tags: ['threejs', 'typescript'],
});
routes.set('vinneyto-physics', {
  demo: createPhysicsDemo,
  title: 'Physics',
  authors: 'vinneyto',
  tags: ['wasm', 'rust', 'threejs', 'typescript'],
});
routes.set('natalyj-triangle', {
  demo: natalyjDrawTriangle,
  title: 'Triangle',
  authors: 'natalyj',
  tags: ['typescript', 'webgl'],
});
routes.set('vinneyto-camera-demo', {
  demo: vinneytoCreateCameraDemo,
  title: 'Camera',
  authors: 'vinneyto',
  tags: ['threejs', 'typescript'],
});
routes.set('vinneyto-wasm-gltf-demo', {
  demo: vinneytoWasmGltfDemo,
  title: 'Wasm GLTF renderer',
  authors: 'vinneyto',
  tags: ['wasm', 'rust', 'typescript'],
});
