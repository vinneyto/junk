import { GLTFBase } from './GLTFBase';

export interface GLTFNode extends GLTFBase {
  camera?: number;
  children?: number[];
  skin?: number;
  matrix?: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];
  mesh?: number;
  rotation?: [number, number, number, number];
  translation?: [number, number, number];
  scale?: [number, number, number];
  weights?: number[];
}
