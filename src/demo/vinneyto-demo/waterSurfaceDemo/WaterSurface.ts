import { Mesh, MeshBasicMaterial, PlaneBufferGeometry } from 'three';

export class WaterSurface extends Mesh {
  constructor(width: number, height: number) {
    const geometry = new PlaneBufferGeometry(width, height);
    geometry.rotateX(-Math.PI / 2);
    const material = new MeshBasicMaterial({ color: 'blue' });

    super(geometry, material);
  }
}
