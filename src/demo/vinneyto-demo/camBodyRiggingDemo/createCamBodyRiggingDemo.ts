import { Color, PerspectiveCamera } from 'three';
import { createRenderer, resizeRendererToDisplaySize } from '../../../util';
import { Demo } from '../../Demo';
import { CharacterContainer } from './CharacterConteiner/CharacterContainer';
import { createPoseDetector } from './createPoseDetector';
import { createVideo } from './createVideo';
import { VideoContainer } from './VideoContainer/VideoContainer';

export async function createCamBodyRiggingDemo(): Promise<Demo> {
  const renderer = createRenderer();

  const video = await createVideo();
  const detector = await createPoseDetector();

  let poses = await detector.estimatePoses(video, { flipHorizontal: true });
  let poseEstemated = true;

  const videoContainer = new VideoContainer(video);
  const characterContainer = new CharacterContainer();

  const views = [
    {
      left: 0,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: videoContainer.camera,
      scene: videoContainer.scene,
      background: new Color('gray'),
    },
    {
      left: 0.5,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: characterContainer.camera,
      scene: characterContainer.scene,
      background: new Color('gray'),
    },
  ];

  const render = () => {
    if (poseEstemated) {
      detector.estimatePoses(video, { flipHorizontal: true }).then((p) => {
        poseEstemated = true;
        poses = p;
      });
      poseEstemated = false;
    }

    renderer.setScissorTest(true);

    resizeRendererToDisplaySize(renderer);

    if (poses.length > 0) {
      videoContainer.poseDebug.setValues(poses[0]);
      characterContainer.poseDebug.setValues(poses[0]);
    }

    for (let i = 0; i < views.length; i++) {
      const view = views[i];
      const left = Math.floor(window.innerWidth * view.left);
      const bottom = Math.floor(window.innerHeight * view.bottom);
      const width = Math.floor(window.innerWidth * view.width);
      const height = Math.floor(window.innerHeight * view.height);

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);
      renderer.setClearColor(view.background);

      if (view.camera instanceof PerspectiveCamera) {
        view.camera.aspect = width / height;
        characterContainer.cameraController.update(view.camera);
      }

      renderer.render(view.scene, view.camera);
    }
  };

  return { render };
}
