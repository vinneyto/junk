export interface GLTFPrimitive {
  attributes: Record<string, number>;
  indices?: number;
  material?: number;
  mode?: number;
  targets?: number;
  extensions?: object;
  extras?: any;
}
