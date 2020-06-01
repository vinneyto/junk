use na::{Matrix4, Vector3};

use crate::renderer::webgl::define::Define;

#[derive(Debug, Clone)]
pub struct CameraState {
  pub view: Matrix4<f32>,
  pub projection: Matrix4<f32>,
}

#[derive(Debug, Clone)]
pub enum Uniform {
  Float { name: String, value: f32 },
  Vector3 { name: String, value: Vector3<f32> },
  Matrix4 { name: String, value: Matrix4<f32> },
}

pub trait MaterialParams {
  fn get_tag(&self) -> String;
  fn get_shader_src(&self) -> (String, String);
  fn get_defines(&self) -> Vec<Define>;
  fn get_uniforms(&self, camera_state: &CameraState) -> Vec<Uniform>;
}
