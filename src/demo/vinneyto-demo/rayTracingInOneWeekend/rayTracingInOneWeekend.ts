import { debounce } from 'lodash';
import { Demo } from '../../Demo';
import {
  Scene,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Mesh,
  Vector2,
  Sphere,
  Vector3,
  Color,
  PerspectiveCamera,
  SphereBufferGeometry,
  MeshLambertMaterial,
  DirectionalLight,
  Matrix4,
  Camera,
  WebGLRenderTarget,
  MeshBasicMaterial,
} from 'three';
import { createRenderer, resizeRendererToDisplaySize } from '../../../util';
import vertSrc from './shaders/weekend_vert.glsl';
import fragSrc from './shaders/weekend_frag.glsl';
import { World } from './World';
import { createNoiseTexture } from './helpers';
import { CameraController } from '../../../CameraController';

export async function rayTracingInOneWeekend(): Promise<Demo> {
  const renderer = createRenderer();
  renderer.shadowMap.enabled = true;

  const cameraController = new CameraController(3, 0.01);
  const camera = new PerspectiveCamera(75, 1, 0.001, 10);

  // rtx

  const world = new World();

  world.spheres.push(new Sphere(new Vector3(0, 0.2, 0), 0.5));
  world.spheres.push(new Sphere(new Vector3(-1, 0, 0), 0.3));
  world.spheres.push(new Sphere(new Vector3(1, 0, 0), 0.3));
  world.spheres.push(new Sphere(new Vector3(0, -100.3, 0), 100));

  const noiseTexture = createNoiseTexture(512);

  const rtxScene = new Scene();
  const geometry = new PlaneBufferGeometry(2, 2);
  const material = new RawShaderMaterial({
    vertexShader: vertSrc,
    fragmentShader: fragSrc,
    uniforms: {
      resolution: { value: new Vector2() },
      worldTexture: { value: world.createTexture() },
      noiseTexture: { value: noiseTexture },
      shiftSphere: { value: 0 },
      inverseMVP: { value: new Matrix4() },
    },
    defines: {
      WORLD_COUNT: world.getCount(),
      RAY_DEPTH: 50,
      SAMPLES_PER_PIXEL: 50,
    },
  });
  const screen = new Mesh(geometry, material);
  rtxScene.add(screen);

  const rtxRenderTarget = new WebGLRenderTarget(1, 1);
  const rtxDisplayMesh = new Mesh(
    new PlaneBufferGeometry(2, 2),
    new MeshBasicMaterial({ map: rtxRenderTarget.texture })
  );
  const rtxDisplayScene = new Scene();
  rtxDisplayScene.add(rtxDisplayMesh);
  const rtxDisplayCamera = new Camera();

  // classic
  const classicScene = new Scene();

  const light = new DirectionalLight();
  light.castShadow = true;
  light.position.set(0, 1, 0);
  classicScene.add(light);

  world.spheres.forEach((s) => {
    const mesh = new Mesh(
      new SphereBufferGeometry(s.radius, 32, 32),
      new MeshLambertMaterial({ color: new Color('white') })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(s.center);
    classicScene.add(mesh);
  });

  const views = [
    {
      left: 0,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: camera,
      scene: classicScene,
      background: new Color('gray'),
    },
    {
      left: 0.5,
      bottom: 0,
      width: 0.5,
      height: 1,
      camera: camera,
      scene: rtxScene,
      background: new Color('black'),
    },
  ];

  let dirty = true;

  cameraController.onRotate = debounce(() => {
    dirty = true;
  }, 500);

  const render = () => {
    renderer.setScissorTest(true);

    if (resizeRendererToDisplaySize(renderer)) {
      dirty = true;

      rtxRenderTarget.setSize(
        renderer.domElement.width / 2,
        renderer.domElement.height
      );
    }

    cameraController.update(camera);

    for (let i = 0; i < views.length; i++) {
      const view = views[i];
      const left = Math.floor(window.innerWidth * view.left);
      const bottom = Math.floor(window.innerHeight * view.bottom);
      const width = Math.floor(window.innerWidth * view.width);
      const height = Math.floor(window.innerHeight * view.height);

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);
      renderer.setClearColor(view.background);

      view.camera.aspect = width / height;

      view.camera.updateProjectionMatrix();

      if (view.scene === rtxScene) {
        if (dirty) {
          material.uniforms.resolution.value.set(
            renderer.domElement.width * view.width,
            renderer.domElement.height * view.height
          );

          const matrix = new Matrix4()
            .multiply(camera.projectionMatrix)
            .multiply(camera.matrixWorldInverse)
            .invert();

          material.uniforms.inverseMVP.value.copy(matrix);

          renderer.setRenderTarget(rtxRenderTarget);
          renderer.render(view.scene, view.camera);
          renderer.setRenderTarget(null);

          dirty = false;
        }

        renderer.render(rtxDisplayScene, rtxDisplayCamera);
      } else {
        renderer.render(view.scene, view.camera);
      }
    }
  };

  return { render };
}
