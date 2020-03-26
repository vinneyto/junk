import { createBoxDemo } from './demo/createBoxDemo';
import { Demo } from './demo/Demo';

export const routes = new Map<string, () => Demo>();
routes.set('box', createBoxDemo);
