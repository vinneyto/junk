import { createBoxDemo } from './demo/createBoxDemo';
import { Demo } from './demo/Demo';
import { useSingleColorShaderMaterial as natalyjSingleColorShaderMaterial } from './demo/natalyj-demo/SingleColorShaderMaterial/useSingleColorShaderMaterial';
import { useSplitColorShaderMaterial as natalyjSplitColorShaderMaterial } from './demo/natalyj-demo/SplitColorShaderMaterial/useSplitColorShaderMaterial';
import { createWasmDemoFactory } from './demo/createWasmDemoFactory';
import { useScanner as natalyjScanner } from './demo/natalyj-demo/Scanner/useScanner';
import { createPhysicsDemo } from './demo/vinneyto-demo/createPhysicsDemo';
import { drawTriangle as natalyjDrawTriangle } from './demo/natalyj-demo/Triangle/drawTriangle';
import { createGltfSkinningDemo as vinneytoCreateGltfSkinningDemo } from './demo/vinneyto-demo/createGltfSkinningDemo';

const vinneytoWasmTriangleDemo = createWasmDemoFactory('TriangleDemo');
const vinneytoWasmSkinningDemo = createWasmDemoFactory('SkinningDemo');

export const routes = new Map<string, () => Promise<Demo>>();
routes.set('box', createBoxDemo);
routes.set(
  'natalyj-singleColorShaderMaterial',
  natalyjSingleColorShaderMaterial
);
routes.set('natalyj-splitColorShaderMaterial', natalyjSplitColorShaderMaterial);
routes.set('vinneyto-wasm-webgl2-triangle', vinneytoWasmTriangleDemo);
routes.set('vinneyto-wasm-skinning', vinneytoWasmSkinningDemo);
routes.set('vinneyto-gltf-skinning', vinneytoCreateGltfSkinningDemo);
routes.set('natalyj-scanner', natalyjScanner);
routes.set('vinneyto-physics', createPhysicsDemo);
routes.set('natalyj-triangle', natalyjDrawTriangle);
