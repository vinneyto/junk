import { DrawMode, AttributeOptions } from '../types';

export interface Attribute {
  buffer: string;
  options: AttributeOptions;
}

export interface Geometry {
  attributes: Map<string, Attribute>;
  count: number;
  indices?: Attribute;
  mode?: DrawMode;
}
