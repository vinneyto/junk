import { Demo } from '../../Demo';
import {
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  Mesh,
  Color,
  Vector3,
  AxesHelper,
  Plane,
  PlaneHelper,
  Object3D,
  MeshStandardMaterial,
  Shader,
  DirectionalLight,
  AmbientLight,
  WebGLRenderer,
  AnimationMixer,
  AnimationAction,
  Clock,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import Fox from '../models/Fox/Fox.gltf';

import { CameraController } from '../../../CameraController';
import { createRenderer, resizeRenderer, fetchGLTF } from '../../../util';

import { SplitColorShaderMaterial } from './SplitColorShaderMaterial';
import { createCustomGUI } from './createCustomGUI';
import { ColorConfig, AvailableObjects } from './types';

const FAR = 400;
const RADIUS = 200;
const BOX_SIZE = 100;
const HELPER_SIZE = 300;

export async function useSplitColorShaderMaterial(): Promise<Demo> {
  const renderer = createRenderer();
  const camera = new PerspectiveCamera(75, 1, 0.01, FAR);
  const cameraController = new CameraController(RADIUS, 0.01);
  const scene = new Scene();

  const colorConfig: ColorConfig = {
    negativeColor: new Color('green'),
    positiveColor: new Color('red'),
    planeNormal: new Vector3(0.7, 0.3, 0.1),
    distanceFromOrigin: 2,
  };

  const material = new SplitColorShaderMaterial(colorConfig);

  const geometry = new BoxGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
  const box = new Mesh(geometry, material);
  scene.add(box);

  const possibleObjects = new Map<AvailableObjects, Object3D>();
  possibleObjects.set(AvailableObjects.Box, box);

  const gltf = await fetchGLTF(Fox);

  const mixer = new AnimationMixer(gltf.scene);
  const actions = new Map<string, AnimationAction>();
  gltf.animations.forEach((c) => {
    const action = mixer.clipAction(c);
    actions.set(c.name, action);
  });

  const runAction = actions.get('Run');
  if (runAction !== undefined) {
    runAction.play();
  }

  gltf.scene.traverse((obj) => {
    if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
      patchStandardMaterialToSplit(obj.material, material);
    }
  });
  possibleObjects.set(AvailableObjects.Fox, gltf.scene);
  gltf.scene.visible = false;
  scene.add(gltf.scene);

  const axesHelper = new AxesHelper(HELPER_SIZE);
  scene.add(axesHelper);

  const { planeNormal, distanceFromOrigin } = colorConfig;
  const plane = new Plane(planeNormal, distanceFromOrigin);
  const planeHelper = new PlaneHelper(plane, HELPER_SIZE, 0x0000ff);
  scene.add(planeHelper);

  const sun = new DirectionalLight();
  sun.position.set(0, 1, 0);
  scene.add(sun);

  scene.add(new AmbientLight());

  createCustomGUI({
    planeObjects: { plane, planeHelper },
    objectsToDisplay: { currentObject: AvailableObjects.Box, possibleObjects },
    customMaterial: material,
    colorConfig,
  });

  const clock = new Clock();

  const render = () => {
    resizeRenderer(renderer, camera);
    cameraController.update(camera);

    const delta = clock.getDelta();

    mixer.update(delta);

    renderer.render(scene, camera);
  };

  return { render };
}

export function patchStandardMaterialToSplit(
  standardMaterial: MeshStandardMaterial,
  splitMaterial: SplitColorShaderMaterial
) {
  const oldOnBeforeCompile = standardMaterial.onBeforeCompile;

  standardMaterial.onBeforeCompile = (
    shader: Shader,
    renderer: WebGLRenderer
  ) => {
    oldOnBeforeCompile.call(standardMaterial, shader, renderer);

    Object.assign(shader.uniforms, splitMaterial.uniforms);

    const INCLUDE_COMMON = '#include <common>';

    const vertexCommon = [
      INCLUDE_COMMON,
      'uniform mat4 u_basis;',
      'varying vec4 v_position;',
    ].join('\n');

    const vertexVPosition = [
      '#include <fog_vertex>',
      'v_position = u_basis * modelMatrix * vec4(transformed, 1.0);',
    ].join('\n');

    shader.vertexShader = shader.vertexShader.replace(
      INCLUDE_COMMON,
      vertexCommon
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <fog_vertex>',
      vertexVPosition
    );

    const fragmentCommon = [
      INCLUDE_COMMON,
      'uniform vec3 u_color1;',
      'uniform vec3 u_color2;',
      'varying vec4 v_position;',
    ].join('\n');

    const GL_FRAG_COLOR =
      'gl_FragColor = vec4( outgoingLight, diffuseColor.a );';

    const fragmentColor = [
      'vec3 splitColor = v_position.z < 0.0 ? u_color1 : u_color2;',
      'outgoingLight = mix(outgoingLight, splitColor, 0.5);',
      GL_FRAG_COLOR,
    ].join('\n');

    shader.fragmentShader = shader.fragmentShader.replace(
      INCLUDE_COMMON,
      fragmentCommon
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      GL_FRAG_COLOR,
      fragmentColor
    );
  };
}
