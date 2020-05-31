use generational_arena::{Arena, Index};
use na::{Matrix4, Vector3};
use std::collections::HashMap;
use web_sys::{WebGlBuffer, WebGlRenderingContext, WebGlTexture};

use super::context::Context;
use super::shader::{AttributeOptions, Shader};
use crate::scene::scene::Scene;

#[derive(Debug, Clone)]
pub struct Attribute {
  pub buffer: Index,
  pub options: AttributeOptions,
}

#[derive(Debug, Clone)]
pub struct Geometry {
  pub attributes: HashMap<String, Attribute>,
  pub indices: Option<Index>,
  pub count: u32,
}

#[derive(Debug, Clone)]
pub struct DebugMaterialParams {
  color: Vector3<f32>,
}

#[derive(Debug, Clone)]
pub enum Material {
  Debug(DebugMaterialParams),
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub geometry: Geometry,
  pub material: Material,
}

pub struct CameraState {
  pub view_matrix: Matrix4<f32>,
  pub projection_matrix: Matrix4<f32>,
}

pub struct Renderer {
  ctx: Context,
  buffers: Arena<WebGlBuffer>,
  textures: Arena<WebGlTexture>,
  shaders: HashMap<String, Shader>,
}

impl Renderer {
  pub fn new(gl: WebGlRenderingContext) -> Renderer {
    let ctx = Context::new(gl);
    let buffers = Arena::new();
    let textures = Arena::new();
    let shaders = HashMap::new();
    Renderer {
      ctx,
      buffers,
      textures,
      shaders,
    }
  }

  pub fn render(&self, scene: &Scene, meshes: &Arena<Mesh>, camera_state: &CameraState) {}

  fn bind_geometry(&self) {}
}
