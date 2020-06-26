import { Material } from './Material';
import { Geometry } from './Geometry';

interface Primitive {
  material: Material;
  geometry: Geometry;
}

export interface Mesh {
  name: string;
  primitives: Primitive[];
}
