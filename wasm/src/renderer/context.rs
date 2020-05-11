use super::define::Define;
use super::shader::Shader;
use anyhow::Result;
use js_sys::{Float32Array, Object, Uint16Array, WebAssembly};
use num_traits::Num;
use std::default::Default;
use wasm_bindgen::{JsCast, JsValue};
use web_sys::{WebGl2RenderingContext, WebGlBuffer, WebGlVertexArrayObject};

pub struct Context {
  gl: WebGl2RenderingContext,
}

impl Context {
  pub fn new(gl: WebGl2RenderingContext) -> Context {
    Context { gl }
  }

  pub fn viewport(&self, x: i32, y: i32, width: i32, height: i32) {
    self.gl.viewport(x, y, width, height);
  }

  pub fn clear(&self, target: Cleaning) {
    self.gl.clear(target.as_u32());
  }

  pub fn clear_color(&self, r: f32, g: f32, b: f32, a: f32) {
    self.gl.clear_color(r, g, b, a);
  }

  pub fn create_shader(
    &self,
    vertex_src: &str,
    fragment_src: &str,
    defines: &[Define],
  ) -> Result<Shader> {
    let shader = Shader::new(&self.gl, vertex_src, fragment_src, defines)?;

    Ok(shader)
  }

  pub fn create_buffer<T: BufferItem>(
    &self,
    target: BufferTarget,
    usage: BufferUsage,
    data: &[T],
  ) -> Option<WebGlBuffer> {
    let buffer = self.gl.create_buffer()?;

    self.gl.bind_buffer(target.as_u32(), Some(&buffer));

    let start = data.as_ptr() as u32 / size_u32::<T>();
    let end = start + data.len() as u32;
    let array = get_typed_array::<T>(start, end);

    self
      .gl
      .buffer_data_with_array_buffer_view(target.as_u32(), &array, usage.as_u32());

    self.gl.bind_buffer(target.as_u32(), None);

    Some(buffer)
  }

  pub fn create_buffer_from_slice(
    &self,
    target: BufferTarget,
    usage: BufferUsage,
    data: &[u8],
  ) -> Option<WebGlBuffer> {
    let buffer = self.gl.create_buffer()?;

    self.gl.bind_buffer(target.as_u32(), Some(&buffer));

    self
      .gl
      .buffer_data_with_u8_array(target.as_u32(), data, usage.as_u32());

    self.gl.bind_buffer(target.as_u32(), None);

    Some(buffer)
  }

  pub fn bind_buffer_base(
    &self,
    target: BufferBaseTarget,
    index: u32,
    buffer: Option<&WebGlBuffer>,
  ) {
    self.gl.bind_buffer_base(target.as_u32(), index, buffer)
  }

  pub fn bind_buffer(&self, target: BufferTarget, buffer: Option<&WebGlBuffer>) {
    self.gl.bind_buffer(target.as_u32(), buffer);
  }

  pub fn bind_attribute(&self, buffer: Option<&WebGlBuffer>, attribute: &AttributeOptions) {
    self.bind_buffer(BufferTarget::ArrayBuffer, buffer);
    self
      .gl
      .enable_vertex_attrib_array(attribute.location as u32);
    self.gl.vertex_attrib_pointer_with_i32(
      attribute.location as u32,
      attribute.item_size,
      attribute.component_type as u32,
      attribute.normalized,
      attribute.stride,
      attribute.offset,
    );
  }

  pub fn create_vertex_array(&self) -> Option<WebGlVertexArrayObject> {
    self.gl.create_vertex_array()
  }

  pub fn bind_vertex_array(&self, vao: Option<&WebGlVertexArrayObject>) {
    self.gl.bind_vertex_array(vao);
  }

  pub fn draw_arrays(&self, mode: DrawMode, first: i32, count: i32) {
    self.gl.draw_arrays(mode.as_u32(), first, count);
  }

  pub fn draw_elements(
    &self,
    mode: DrawMode,
    count: i32,
    component_type: ComponentType,
    offset: i32,
  ) {
    self
      .gl
      .draw_elements_with_i32(mode.as_u32(), count, component_type as u32, offset);
  }
}

pub enum Cleaning {
  Color,
  Depth,
}

impl Cleaning {
  pub fn as_u32(&self) -> u32 {
    match self {
      Self::Color => WebGl2RenderingContext::COLOR_BUFFER_BIT,
      Self::Depth => WebGl2RenderingContext::DEPTH_BUFFER_BIT,
    }
  }
}

#[derive(Debug, Clone, Copy)]
pub enum ComponentType {
  Byte = 5120,
  UnsignedByte = 5121,
  Short = 5122,
  UnsignedShort = 5123,
  UnsignedInt = 5125,
  Float = 5126,
}

impl Default for ComponentType {
  fn default() -> Self {
    Self::Float
  }
}

#[derive(Debug, Default)]
pub struct AttributeOptions {
  pub location: i32,
  pub component_type: ComponentType,
  pub item_size: i32,
  pub normalized: bool,
  pub stride: i32,
  pub offset: i32,
}

pub enum BufferTarget {
  ArrayBuffer,        // for generic data
  ElementArrayBuffer, // for indices only
}

impl BufferTarget {
  pub fn as_u32(&self) -> u32 {
    match self {
      Self::ArrayBuffer => WebGl2RenderingContext::ARRAY_BUFFER,
      Self::ElementArrayBuffer => WebGl2RenderingContext::ELEMENT_ARRAY_BUFFER,
    }
  }
}

pub enum BufferUsage {
  StaticDraw,
  DynamicDraw,
  StreamDraw,
}

impl BufferUsage {
  pub fn as_u32(&self) -> u32 {
    match self {
      Self::StaticDraw => WebGl2RenderingContext::STATIC_DRAW,
      Self::DynamicDraw => WebGl2RenderingContext::DYNAMIC_DRAW,
      Self::StreamDraw => WebGl2RenderingContext::STREAM_DRAW,
    }
  }
}

pub enum BufferBaseTarget {
  TransformFeedbackBuffer,
  UniformBuffer,
}

impl BufferBaseTarget {
  pub fn as_u32(&self) -> u32 {
    match self {
      Self::TransformFeedbackBuffer => WebGl2RenderingContext::TRANSFORM_FEEDBACK_BUFFER,
      Self::UniformBuffer => WebGl2RenderingContext::UNIFORM_BUFFER,
    }
  }
}

pub enum DrawMode {
  Triangles,
}

impl DrawMode {
  pub fn as_u32(&self) -> u32 {
    match self {
      Self::Triangles => WebGl2RenderingContext::TRIANGLES,
    }
  }
}

pub enum TypedArrayKind {
  Uint16,
  Float32,
}

impl TypedArrayKind {
  pub fn as_u32(&self) -> u32 {
    match self {
      TypedArrayKind::Uint16 => WebGl2RenderingContext::UNSIGNED_SHORT,
      TypedArrayKind::Float32 => WebGl2RenderingContext::FLOAT,
    }
  }
}

fn size_u32<T>() -> u32 {
  std::mem::size_of::<T>() as u32
}

fn get_memory_buffer() -> JsValue {
  wasm_bindgen::memory()
    .dyn_into::<WebAssembly::Memory>()
    .unwrap_or_else(|_| panic!("Should be a memory"))
    .buffer()
}

fn get_typed_array<T: BufferItem>(start: u32, end: u32) -> Object {
  let buffer = get_memory_buffer();
  match T::array_kind() {
    TypedArrayKind::Uint16 => Uint16Array::new(&buffer).subarray(start, end).into(),
    TypedArrayKind::Float32 => Float32Array::new(&buffer).subarray(start, end).into(),
  }
}

pub trait BufferItem: Num {
  fn array_kind() -> TypedArrayKind;
}
impl BufferItem for u16 {
  fn array_kind() -> TypedArrayKind {
    TypedArrayKind::Uint16
  }
}
impl BufferItem for f32 {
  fn array_kind() -> TypedArrayKind {
    TypedArrayKind::Float32
  }
}
