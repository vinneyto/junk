use generational_arena::{Arena, Index};
use na::Matrix4;
use na::Vector3;
use std::collections::HashMap;
use std::default::Default;
use web_sys::WebGlBuffer;

use crate::scene::scene::Scene;

use super::context::Context;
use super::shader::Shader;
use super::shader::{AttributeName, AttributeOptions};

#[derive(Debug, Clone)]
pub struct Accessor {
  pub buffer: Index,
  pub count: i32,
  pub options: AttributeOptions,
}

pub type Attributes = HashMap<AttributeName, Index>;
pub type Indices = Option<Index>;

#[derive(Debug, Clone)]
pub struct Primitive {
  pub attributes: Attributes,
  pub indices: Indices,
  pub material: Option<Index>,
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub primitives: Vec<Primitive>,
  pub name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct PBRMaterialParams {
  pub color: Vector3<f32>,
}

#[derive(Debug, Clone)]
pub enum Material {
  PBR(PBRMaterialParams),
}

#[derive(Debug, Clone)]
pub struct Camera {
  pub view: Matrix4<f32>,
  pub projection: Matrix4<f32>,
}

impl Default for Camera {
  fn default() -> Self {
    Camera {
      view: Matrix4::identity(),
      projection: Matrix4::identity(),
    }
  }
}

impl Camera {
  pub fn new(view: Matrix4<f32>, projection: Matrix4<f32>) -> Self {
    Camera { view, projection }
  }
}

pub type Buffers = Arena<WebGlBuffer>;
pub type Accessors = Arena<Accessor>;
pub type Materials = Arena<Material>;
pub type Meshes = Arena<Mesh>;
pub type Cameras = Arena<Camera>;
pub type Shaders = HashMap<String, Shader>;

#[derive(Debug)]
pub struct RenderStore {
  pub ctx: Context,
  pub buffers: Buffers,
  pub accessors: Accessors,
  pub materials: Materials,
  pub meshes: Meshes,
  pub cameras: Cameras,
  pub scene: Scene,
  pub shaders: Shaders,
}

impl RenderStore {
  pub fn new(ctx: Context) -> Self {
    RenderStore {
      ctx,
      buffers: Buffers::default(),
      accessors: Accessors::default(),
      materials: Materials::default(),
      meshes: Meshes::default(),
      cameras: Cameras::default(),
      scene: Scene::new(),
      shaders: HashMap::new(),
    }
  }
}
