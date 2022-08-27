import { createBoxDemo } from './demo/createBoxDemo';
import { Demo } from './demo/Demo';
import { useSingleColorShaderMaterial as natalyjSingleColorShaderMaterial } from './demo/natalyj-demo/SingleColorShaderMaterial/useSingleColorShaderMaterial';
import { useSplitColorShaderMaterial as natalyjSplitColorShaderMaterial } from './demo/natalyj-demo/SplitColorShaderMaterial/useSplitColorShaderMaterial';
import { createWasmDemoFactory } from './demo/createWasmDemoFactory';
import { useScanner as natalyjScanner } from './demo/natalyj-demo/Scanner/useScanner';
import { drawTriangle as natalyjDrawTriangle } from './demo/natalyj-demo/Triangle/drawTriangle';
import { createWasmGltfDemo as vinneytoWasmGltfDemo } from './demo/vinneyto-demo/createWasmGltfDemo';
import { createCameraDemo as vinneytoCreateCameraDemo } from './demo/vinneyto-demo/createCameraDemo';
import { createPerlinNoiseDemo as vinneytoPerlinNoiseDemo } from './demo/vinneyto-demo/perlinNoiseDemo';
import { createWaterSurfaceDemo as createVinneytoWaterSurfaceDemo } from './demo/vinneyto-demo/waterSurfaceDemo/createWaterSurfaceDemo';
import { rayTracingInOneWeekend } from './demo/vinneyto-demo/rayTracingInOneWeekend/rayTracingInOneWeekend';
import { createImageClassifyDemo } from './demo/vinneyto-demo/createImageClassifyDemo';
import { createWebGPUCubeDemo } from './demo/vinneyto-demo/webgpuCubeDemo/createWebGPUCubeDemo';
import { petDetectionDemo } from './demo/vinneyto-demo/petDetectionDemo';
import { objectsDetectionImageDemo } from './demo/vinneyto-demo/objectsDetectionImageDemo';
import { objectsDetectionVideoDemo } from './demo/vinneyto-demo/objectsDetectionVideoDemo';
import { nonlinearTraining101 } from './demo/vinneyto-demo/nonlinearTraining101';
import { titanicTraining } from './demo/vinneyto-demo/titanicTraining';
import { sortingHatDemo } from './demo/vinneyto-demo/sortingHatDemo/sortingHatDemo';

interface RouteInfo {
  demo: () => Promise<Demo | void>;
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
  tags: ['wasm', 'rust', 'webgl', 'typescript'],
});
routes.set('vinneyto-perlin-noise-demo', {
  demo: vinneytoPerlinNoiseDemo,
  title: 'Perlin noise',
  authors: 'vinneyto',
  tags: ['wasm', 'rust', 'webgl', 'typescript'],
});
routes.set('vinneyto-water-surface-demo', {
  demo: createVinneytoWaterSurfaceDemo,
  title: 'Water surface',
  authors: 'vinneyto',
  tags: ['wasm', 'rust', 'webgl', 'threejs', 'typescript'],
});
routes.set('vinneyto-raytracing-in-one-weekend', {
  demo: rayTracingInOneWeekend,
  title: 'Ray Tracing in One Weekend',
  authors: 'vinneyto',
  tags: ['typescript', 'webgl', 'threejs'],
});
routes.set('vinneyto-image-classify', {
  demo: createImageClassifyDemo,
  title: 'Image classification',
  authors: 'vinneyto',
  tags: ['typescript', 'tensorflow'],
});
routes.set('vinneyto-webgpu-cube', {
  demo: createWebGPUCubeDemo,
  title: 'WebGPU cube',
  authors: 'vinneyto',
  tags: ['typescript', 'webgpu'],
});
routes.set('pet-detection-demo', {
  demo: petDetectionDemo,
  title: 'Pet face detection',
  authors: 'vinneyto',
  tags: ['typescript', 'tensorflow'],
});
routes.set('objects-detection-image-demo', {
  demo: objectsDetectionImageDemo,
  title: 'Objects detection image demo',
  authors: 'vinneyto',
  tags: ['typescript', 'tensorflow'],
});
routes.set('objects-detection-video-demo', {
  demo: objectsDetectionVideoDemo,
  title: 'Objects detection video demo',
  authors: 'vinneyto',
  tags: ['typescript', 'tensorflow'],
});
routes.set('linear-approx-model-demo', {
  demo: nonlinearTraining101,
  title: 'Nonlinear training 101',
  authors: 'vinneyto',
  tags: ['typescript', 'tensorflow'],
});
routes.set('titanic-training-demo', {
  demo: titanicTraining,
  title: 'Titanic training',
  authors: 'vinneyto',
  tags: ['typescript', 'tensorflow'],
});
routes.set('sorting-hat-demo', {
  demo: sortingHatDemo,
  title: 'Sorting hat',
  authors: 'vinneyto',
  tags: ['typescript', 'tensorflow'],
});
