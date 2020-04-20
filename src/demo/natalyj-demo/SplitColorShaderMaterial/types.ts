import {
  Plane,
  PlaneHelper,
  Vector3,
  Object3D,
  Color,
  ColorKeyframeTrack,
} from 'three';
import { SplitColorShaderMaterial } from './SplitColorShaderMaterial';

export interface ColorConfig {
  negativeColor: Color;
  positiveColor: Color;
  planeNormal: Vector3;
  distanceFromOrigin: number;
}

export const enum AvailableObjects {
  Box = 'Box',
  Fox = 'Fox',
}

export interface GUIConfig {
  planeObjects: {
    plane: Plane;
    planeHelper: PlaneHelper;
  };
  objectsToDisplay: {
    currentObject: AvailableObjects;
    possibleObjects: Map<AvailableObjects, Object3D>;
  };
  customMaterial: SplitColorShaderMaterial;
  colorConfig: ColorConfig;
}
