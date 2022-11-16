import * as poseDetection from '@tensorflow-models/pose-detection';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Object3D,
  Points,
  ShaderMaterial,
  Vector2,
} from 'three';

export class PoseDebug2D extends Object3D {
  public readonly eyes = new PoseFragment2D(9);

  constructor() {
    super();

    this.add(this.eyes);
  }

  setResolution(x: number, y: number) {
    this.eyes.setResolution(x, y);
  }

  setValues(pose: poseDetection.Pose) {
    this.eyes.setValues(pose, [8, 6, 5, 4, 0, 1, 2, 3, 7]);
  }
}

class PoseFragment2D extends Points {
  constructor(pointsCount: number) {
    super();

    this.material = new ShaderMaterial({
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

    this.geometry = new BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new Float32BufferAttribute(new Float32Array(pointsCount * 2), 2)
    );
  }

  setResolution(x: number, y: number) {
    const material = this.material as ShaderMaterial;
    const resolution = material.uniforms.resolution.value as Vector2;

    resolution.set(x, y);
  }

  setValues(pose: poseDetection.Pose, ids: number[]) {
    const geometry = this.geometry as BufferGeometry;
    const position = geometry.getAttribute('position');
    const array = position.array as Float32Array;
    let j = 0;

    for (let i = 0; i < pose.keypoints.length; i++) {
      if (ids.includes(i)) {
        array[j + 0] = pose.keypoints[i].x;
        array[j + 1] = pose.keypoints[i].y;
        j += 2;
      }
    }

    position.needsUpdate = true;
  }
}
