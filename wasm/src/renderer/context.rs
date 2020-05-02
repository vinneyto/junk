use super::define::Define;
use super::shader::Shader;
use anyhow::Result;
use js_sys::{Float32Array, Object, Uint16Array, WebAssembly};
use num_traits::Num;
use wasm_bindgen::{JsCast, JsValue};
use web_sys::{WebGl2RenderingContext, WebGlBuffer};

pub struct Context {
  gl: WebGl2RenderingContext,
}

impl Context {
  pub fn new(gl: WebGl2RenderingContext) -> Context {
    Context { gl }
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
