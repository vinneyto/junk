export type Defines = Map<string, number | boolean>;

export enum ShaderType {
  Vertex = WebGLRenderingContext.VERTEX_SHADER,
  Fragment = WebGLRenderingContext.FRAGMENT_SHADER,
}

export enum Cleansing {
  Color = WebGLRenderingContext.COLOR_BUFFER_BIT,
  Depth = WebGLRenderingContext.DEPTH_BUFFER_BIT,
  Stencil = WebGLRenderingContext.STENCIL_BUFFER_BIT,
}

export interface AttributeOptions {
  itemSize: number;
  componentType: NumberType;
  normalized: boolean;
  stride: number;
  offset: number;
}

export enum DrawMode {
  /** Draw a single squared dot */
  Points = WebGLRenderingContext.POINTS,
  /** Draw a line to the next vertex */
  LineStrip = WebGLRenderingContext.LINE_STRIP,
  /** Draw a line to the next vertex and connect the last and the first ones */
  LineLoop = WebGLRenderingContext.LINE_LOOP,
  /** Draw a line though two consecutive vertices */
  Lines = WebGLRenderingContext.LINES,
  /** Draw a triangle through every three consecutive vertices */
  TriangleStrip = WebGLRenderingContext.TRIANGLE_STRIP,
  /** Draw a triangle through the first vertex and every two consecutive vertices */
  TriangleFan = WebGLRenderingContext.TRIANGLE_FAN,
  /** Draw a triangle through three consecutive vertices */
  Triangles = WebGLRenderingContext.TRIANGLES,
}

export enum NumberType {
  /** signed 8-bit int, values: [-128, 127] */
  Byte = WebGLRenderingContext.BYTE,
  /** signed 16-bit int, values: [-32768, 32767] */
  Short = WebGLRenderingContext.SHORT,
  /** unsigned 8-bit int, values: [0, 255] */
  uByte = WebGLRenderingContext.UNSIGNED_BYTE,
  /** unsigned 16-bit int, values: [0, 65535] */
  uShort = WebGLRenderingContext.UNSIGNED_SHORT,
  /** 32-bit IEEE floating point number */
  Float = WebGLRenderingContext.FLOAT,
}

export enum BindingTarget {
  /** Buffer containing vertex attributes */
  ArrayBuffer = WebGLRenderingContext.ARRAY_BUFFER,
  /** Buffer used for element indices */
  ElementArrayBuffer = WebGLRenderingContext.ELEMENT_ARRAY_BUFFER,
}

export enum DataUsage {
  /** Data is not intended to be changed, but intended to be used many times */
  StaticDraw = WebGLRenderingContext.STATIC_DRAW,
  /** Data is intended to be changed, but intended to be used many times */
  DynamicDraw = WebGLRenderingContext.DYNAMIC_DRAW,
  /** Data is not intended to be changed, but intended to be used a few times */
  StreamDraw = WebGLRenderingContext.STREAM_DRAW,
}

export enum ContextFeature {
  /** Blending of the computed fragment color values */
  Blend = WebGLRenderingContext.BLEND,
  /** Culling of polygons */
  CullFace = WebGLRenderingContext.CULL_FACE,
  /** Depth comparisons and updating of the depth buffer */
  DepthTest = WebGLRenderingContext.DEPTH_TEST,
  /** Dithering of color components before they get written to the color buffer */
  Dither = WebGLRenderingContext.DITHER,
  /** Adding an offset to depth values of polygon's fragments */
  PolygonOffsetFill = WebGLRenderingContext.POLYGON_OFFSET_FILL,
  /** Computation of a temporary coverage value determined by the alpha value */
  SampleAlphaToCoverage = WebGLRenderingContext.SAMPLE_ALPHA_TO_COVERAGE,
  /** ANDing the fragment's coverage with the temporary coverage value */
  SampleCoverage = WebGLRenderingContext.SAMPLE_COVERAGE,
  /** Scissor test that discards fragments that are outside of the scissor rectangle */
  ScissorTest = WebGLRenderingContext.SCISSOR_TEST,
  /** Stencil testing and updating to the stencil buffer */
  StencilTest = WebGLRenderingContext.STENCIL_TEST,
}
