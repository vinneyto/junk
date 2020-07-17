use generational_arena::{Arena, Index};
use na::Vector3;
use std::collections::HashMap;
use web_sys::WebGlBuffer;

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

pub type Buffers = Arena<WebGlBuffer>;
pub type Accessors = Arena<Accessor>;
pub type Materials = Arena<Material>;
pub type Meshes = Arena<Mesh>;
