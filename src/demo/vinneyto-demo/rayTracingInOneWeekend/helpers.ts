import {
  DataTexture,
  FloatType,
  RepeatWrapping,
  RGBFormat,
  Vector3,
} from 'three';

export function createNoiseTexture(size: number) {
  const data = new Float32Array(size * size * 3);
  const v = new Vector3();

  for (let i = 0; i < data.length; i += 3) {
    v.set(rangeRandom(-1, 1), rangeRandom(-1, 1), rangeRandom(-1, 1))
      .normalize()
      .toArray(data, i);
  }

  const texture = new DataTexture(
    data,
    size,
    size,
    RGBFormat,
    FloatType,
    undefined,
    RepeatWrapping,
    RepeatWrapping
  );
  texture.needsUpdate = true;
  return texture;
}

export function rangeRandom(min: number, max: number) {
  return min + Math.random() * (max - min);
}
