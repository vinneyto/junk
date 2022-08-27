import { DataTexture, FloatType, RGBAFormat, Sphere } from 'three';

export class World {
  public readonly spheres: Sphere[] = [];

  createTexture() {
    const height = this.spheres.length;
    const width = 2;
    const numPerRows = width * 4;
    const data = new Float32Array(height * numPerRows);

    for (let i = 0; i < height; i++) {
      const idx = i * numPerRows;
      const sphere = this.spheres[i];

      data[idx + 0] = sphere.center.x;
      data[idx + 1] = sphere.center.y;
      data[idx + 2] = sphere.center.z;
      data[idx + 3] = sphere.radius;
    }

    const texture = new DataTexture(data, width, height, RGBAFormat, FloatType);
    texture.needsUpdate = true;
    return texture;
  }

  getCount() {
    return this.spheres.length;
  }
}
