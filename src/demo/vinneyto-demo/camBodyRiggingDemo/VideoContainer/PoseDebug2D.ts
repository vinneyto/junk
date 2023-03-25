import * as poseDetection from '@tensorflow-models/pose-detection';
import {
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  Object3D,
  Points,
  ShaderMaterial,
  Sphere,
  Vector2,
} from 'three';

const FACE_IDS = [8, 6, 5, 4, 0, 1, 2, 3, 7];
const RIGHT_HAND_IDS = [11, 13, 15, 17, 19, 15, 21];
const BODY_IDS = [12, 24, 23, 11, 12];
const RIGHT_LEG_IDS = [23, 25, 27, 29, 31, 27];

const PART_IDS = [
  FACE_IDS,
  RIGHT_HAND_IDS.map((i) => i + 0),
  RIGHT_HAND_IDS.map((i) => i + 1),
  BODY_IDS,
  RIGHT_LEG_IDS.map((i) => i + 0),
  RIGHT_LEG_IDS.map((i) => i + 1),
];

export class PoseDebug2D extends Object3D {
  public readonly fragments: PoseFragment2D[] = [];

  constructor() {
    super();

    for (const ids of PART_IDS) {
      const fragment = new PoseFragment2D(ids.length);

      this.fragments.push(fragment);
      this.add(fragment);
    }
  }

  setResolution(x: number, y: number) {
    for (const fragment of this.fragments) {
      fragment.setResolution(x, y);
    }
  }

  setValues(pose: poseDetection.Pose) {
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].setValues(pose, PART_IDS[i]);
    }
  }
}

class PoseFragment2D extends Object3D {
  private readonly geometry: BufferGeometry;
  private readonly material: ShaderMaterial;

  constructor(pointsCount: number) {
    super();

    const material = new ShaderMaterial({
      vertexShader: `
      uniform vec2 resolution;

      void main() {
        vec2 pos = position.xy / resolution;

        pos.y = 1.0 - pos.y;

        gl_Position = vec4(pos.xy * 2.0 - 1.0, 0.0, 1.0);
        gl_PointSize = 10.0;
      }
    `,
      fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
      }
    `,
      uniforms: {
        resolution: {
          value: new Vector2(),
        },
      },
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(new Float32Array(pointsCount * 2), 2)
    );
    geometry.boundingSphere = new Sphere();

    this.geometry = geometry;
    this.material = material;

    const line = new Line();
    line.geometry = geometry;
    line.material = material;
    this.add(line);

    const points = new Points();
    points.geometry = geometry;
    points.material = material;
    this.add(points);
  }

  setResolution(x: number, y: number) {
    const material = this.material as ShaderMaterial;
    const resolution = material.uniforms.resolution.value as Vector2;

    resolution.set(x, y);
  }

  setValues(pose: poseDetection.Pose, ids: number[]) {
    const geometry = this.geometry as BufferGeometry;
    const position = geometry.getAttribute('position') as BufferAttribute;
    const array = position.array as Float32Array;
    let j = 0;

    for (const id of ids) {
      const point = pose.keypoints[id];
      array[j + 0] = point.x;
      array[j + 1] = point.y;
      j += 2;
    }

    position.needsUpdate = true;
  }
}
