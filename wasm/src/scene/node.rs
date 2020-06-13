use generational_arena::Index;
use na::{Matrix4, UnitQuaternion, Vector3};

#[derive(Debug, Clone)]
pub struct Node {
  pub parent: Option<Index>,
  pub children: Vec<Index>,
  pub position: Vector3<f32>,
  pub rotation: UnitQuaternion<f32>,
  pub scale: Vector3<f32>,
  pub matrix_world: Matrix4<f32>,
  pub mesh: Option<Index>,
  pub visible: bool,
  pub name: Option<String>,
}

impl Node {
  pub fn new(parent: Option<Index>) -> Self {
    Node {
      parent,
      children: vec![],
      position: Vector3::new(0.0, 0.0, 0.0),
      rotation: UnitQuaternion::identity(),
      scale: Vector3::new(1.0, 1.0, 1.0),
      matrix_world: Matrix4::identity(),
      mesh: None,
      visible: true,
      name: None,
    }
  }
}
