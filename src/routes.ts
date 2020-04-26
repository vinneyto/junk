import { createBoxDemo } from './demo/createBoxDemo';
import { Demo } from './demo/Demo';
import { useSingleColorShaderMaterial as natalyjSingleColorShaderMaterial } from './demo/natalyj-demo/SingleColorShaderMaterial/useSingleColorShaderMaterial';
import { useSplitColorShaderMaterial as natalyjSplitColorShaderMaterial } from './demo/natalyj-demo/SplitColorShaderMaterial/useSplitColorShaderMaterial';

export const routes = new Map<string, () => Promise<Demo>>();
routes.set('box', createBoxDemo);
routes.set(
  'natalyj-singleColorShaderMaterial',
  natalyjSingleColorShaderMaterial
);
routes.set('natalyj-splitColorShaderMaterial', natalyjSplitColorShaderMaterial);
