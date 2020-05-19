export type Defines = Record<string, string | number | boolean>;

export enum Cleansing {
  Color = WebGLRenderingContext.COLOR_BUFFER_BIT,
  Depth = WebGLRenderingContext.DEPTH_BUFFER_BIT,
  Stencil = WebGLRenderingContext.STENCIL_BUFFER_BIT,
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
  /** unsigned 16-bit integer, values: [0, 65535] */
  uShort = WebGLRenderingContext.UNSIGNED_SHORT,
  /** 32-bit IEEE floating point number */
  Float = WebGLRenderingContext.FLOAT,
}

export enum BindingTarget {
  /** Buffer containing vertex attributes */
  ArrayBuffer = WebGLRenderingContext.ARRAY_BUFFER,
  /** Buffer used for ele,emt indices */
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
