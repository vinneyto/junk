import { vec3 } from 'gl-matrix';
import { NumberType } from '../../engine';

export class Attribute {
  constructor(
    public readonly buffer: string,
    public readonly itemSize: number,
    public readonly componentType: NumberType,
    public readonly normalized: boolean,
    public readonly stride: number,
    public readonly offset: number
  ) {}

  clone() {
    return new Attribute(
      this.buffer,
      this.itemSize,
      this.componentType,
      this.normalized,
      this.stride,
      this.offset
    );
  }
}

export class Geometry {
  constructor(
    public readonly attributes: Map<string, Attribute>,
    public readonly count: number,
    public readonly index?: Attribute
  ) {}

  clone() {
    const attributes = new Map<string, Attribute>();
    for (const [key, attr] of attributes.entries()) {
      attributes.set(key, attr.clone());
    }
    const index = this.index !== undefined ? this.index.clone() : undefined;

    return new Geometry(attributes, this.count, index);
  }
}

export class Material {
  public color: vec3 = vec3.create();
  public colorMap?: string;

  clone() {
    const material = new Material();
    vec3.copy(this.color, material.color);

    return material;
  }
}

export class MeshPrimitive {
  constructor(public geometry: Geometry, public material: Material) {}

  clone() {
    return new MeshPrimitive(this.geometry.clone(), this.material.clone());
  }
}

export class Mesh {
  constructor(public primitives: MeshPrimitive[] = [], public name?: string) {}

  clone() {
    return new Mesh(this.primitives.map((p) => p.clone(), this.name));
  }
}
