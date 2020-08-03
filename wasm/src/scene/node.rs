use generational_arena::Index;
use na::{Isometry3, Matrix4, UnitQuaternion, Vector3, Vector4};

#[derive(Debug, Clone)]
pub struct Node {
  pub parent: Option<Index>,
  pub children: Vec<Index>,
  pub matrix_local: Matrix4<f32>,
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
      matrix_local: Matrix4::identity(),
      matrix_world: Matrix4::identity(),
      mesh: None,
      visible: true,
      name: None,
    }
  }
}

pub fn compose_matrix(
  position: Option<Vector3<f32>>,
  rotation: Option<UnitQuaternion<f32>>,
  scale: Option<Vector3<f32>>,
) -> Matrix4<f32> {
  let p = position.unwrap_or(Vector3::new(0.0, 0.0, 0.0));
  let r = rotation.unwrap_or(UnitQuaternion::identity());
  let s = scale.unwrap_or(Vector3::new(1.0, 1.0, 1.0));

  let isometry = Isometry3::new(p, r.scaled_axis());
  let node_scale_matrix = Matrix4::from_diagonal(&Vector4::new(s.x, s.y, s.z, 1.0));

  isometry.to_homogeneous() * node_scale_matrix
}
