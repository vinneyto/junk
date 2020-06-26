import { DrawMode, AttributeOptions } from '../types';

interface Attribute {
  buffer: string;
  options: AttributeOptions;
}

export interface Geometry {
  attributes: Map<string, Attribute>;
  count: number;
  indices?: Attribute;
  mode?: DrawMode;
}
