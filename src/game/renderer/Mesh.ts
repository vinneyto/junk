import { vec3 } from 'gl-matrix';
import { NumberType } from '../../engine';

export interface Attribute {
  buffer: string;
  itemSize: number;
  componentType: NumberType;
  normalized: boolean;
  stride: number;
  offset: number;
}

export class Geometry {
  constructor(
    public readonly attributes: Map<string, Attribute>,
    public readonly indices: Attribute,
    public readonly count: number
  ) {}
}

export class Material {
  public color: vec3 = vec3.create();
}

export class Mesh {
  constructor(public geometry: Geometry, public material: Material) {}
}
