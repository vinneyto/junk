use generational_arena::Index;
use na::{Isometry3, UnitQuaternion, Vector3};

#[derive(Debug, Clone)]
pub struct Node {
  pub parent: Option<Index>,
  pub children: Vec<Index>,
  pub position: Vector3<f32>,
  pub rotation: UnitQuaternion<f32>,
  pub isometry: Isometry3<f32>,
  pub mesh: Option<Index>,
  pub visible: bool,
}

impl Node {
  pub fn new(parent: Option<Index>) -> Self {
    Node {
      parent,
      children: vec![],
      position: Vector3::new(0.0, 0.0, 0.0),
      rotation: UnitQuaternion::identity(),
      isometry: Isometry3::identity(),
      mesh: None,
      visible: true,
    }
  }
}
