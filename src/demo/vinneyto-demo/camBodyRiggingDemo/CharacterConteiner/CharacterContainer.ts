import {
  AxesHelper,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
} from 'three';
import { CameraController } from '../../../../CameraController';
import { PoseDebug3D } from './PoseDebug3D';

export class CharacterContainer {
  public readonly cameraController = new CameraController(3, 0.01);
  public readonly scene = new Scene();
  public readonly camera = new PerspectiveCamera(75, 1, 1, 5);
  public readonly poseDebug = new PoseDebug3D();

  constructor() {
    const floor = new Mesh(
      new PlaneGeometry(2, 2).rotateX(-Math.PI / 2),
      new MeshBasicMaterial({ color: 'white' })
    );
    floor.position.y = -0.001;

    this.scene.add(floor);

    this.scene.add(new AxesHelper());

    this.scene.add(this.poseDebug);
  }
}
