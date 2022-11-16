import { Color } from 'three';
import { createRenderer, resizeRendererToDisplaySize } from '../../../util';
import { Demo } from '../../Demo';
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

  const views = [
    {
      left: 0,
      bottom: 0,
      width: 1,
      height: 1,
      camera: videoContainer.camera,
      scene: videoContainer.scene,
      background: new Color('gray'),
    },
    // {
    //   left: 0.5,
    //   bottom: 0,
    //   width: 0.5,
    //   height: 1,
    //   camera: camera,
    //   scene: scene,
    //   background: new Color('black'),
    // },
  ];

  const render = () => {
    if (poseEstemated) {
      detector.estimatePoses(video, { flipHorizontal: true }).then((p) => {
        poseEstemated = true;
        poses = p;
        // console.log(poses);
      });
      poseEstemated = false;
    }

    renderer.setScissorTest(true);

    resizeRendererToDisplaySize(renderer);

    if (poses.length > 0) {
      videoContainer.poseDebug.setValues(poses[0]);
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

      renderer.render(view.scene, view.camera);
    }
  };

  return { render };
}
