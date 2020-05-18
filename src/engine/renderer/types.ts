export type Defines = Record<string, string | number | boolean>;

export enum Cleansing {
  Color = WebGLRenderingContext.COLOR_BUFFER_BIT,
  Depth = WebGLRenderingContext.DEPTH_BUFFER_BIT,
  Stencil = WebGLRenderingContext.STENCIL_BUFFER_BIT,
}
