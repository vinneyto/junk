use na::Matrix4;

#[derive(Debug, Clone)]
pub struct CameraState {
  pub view: Matrix4<f32>,
  pub projection: Matrix4<f32>,
}
