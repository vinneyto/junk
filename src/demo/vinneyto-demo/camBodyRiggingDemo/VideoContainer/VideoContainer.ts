import { Camera, Scene, VideoTexture } from 'three';
import { PoseDebug2D } from './PoseDebug2D';

export class VideoContainer {
  public readonly scene = new Scene();
  public readonly camera = new Camera();
  public readonly poseDebug = new PoseDebug2D();
  public readonly videoTexture: VideoTexture;

  constructor(video: HTMLVideoElement) {
    this.scene.add(this.poseDebug);
    this.poseDebug.setResolution(1280, 720);

    this.videoTexture = new VideoTexture(video);

    this.scene.background = this.videoTexture;
  }
}
