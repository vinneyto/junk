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

export class PoseDebug3D extends Object3D {
  public readonly fragments: PoseFragment3D[] = [];

  constructor() {
    super();

    for (const ids of PART_IDS) {
      const fragment = new PoseFragment3D(ids.length);

      this.fragments.push(fragment);
      this.add(fragment);
    }
  }

  setValues(pose: poseDetection.Pose) {
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].setValues(pose, PART_IDS[i]);
    }
  }
}

class PoseFragment3D extends Object3D {
  private readonly geometry: BufferGeometry;

  constructor(pointsCount: number) {
    super();

    const material = new ShaderMaterial({
      vertexShader: `
      void main() {
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
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
      new Float32BufferAttribute(new Float32Array(pointsCount * 3), 3)
    );
    geometry.boundingSphere = new Sphere();

    this.geometry = geometry;

    const line = new Line();
    line.geometry = geometry;
    line.material = material;
    this.add(line);

    const points = new Points();
    points.geometry = geometry;
    points.material = material;
    this.add(points);
  }

  setValues(pose: poseDetection.Pose, ids: number[]) {
    const geometry = this.geometry as BufferGeometry;
    const position = geometry.getAttribute('position') as BufferAttribute;
    const array = position.array as Float32Array;
    let j = 0;

    for (const id of ids) {
      if (pose.keypoints3D) {
        const point = pose.keypoints3D[id];
        array[j + 0] = -point.x;
        array[j + 1] = -point.y;
        array[j + 2] = -(point.z || 0);
      }

      j += 3;
    }

    position.needsUpdate = true;
  }
}
