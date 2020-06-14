use generational_arena::Arena;

use super::geometry::Geometry;
use super::material::Material;

#[derive(Debug, Clone)]
pub struct Primitive {
  pub geometry: Geometry,
  pub material: Material,
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub primitives: Vec<Primitive>,
  pub name: Option<String>,
}

pub type Meshes = Arena<Mesh>;
