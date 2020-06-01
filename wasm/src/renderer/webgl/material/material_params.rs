use generational_arena::Index;
use na::Vector3;

use crate::renderer::webgl::define::Define;

#[derive(Debug, Clone)]
pub enum Uniform {
  Float {
    name: String,
    value: f32,
  },
  Vector3 {
    name: String,
    value: Vector3<f32>,
  },
  Texture {
    name: String,
    unit: u8,
    texture: Index,
  },
}

pub trait MaterialParams {
  fn get_tag(&self) -> String;
  fn get_shader_src(&self) -> (String, String);
  fn get_defines(&self) -> Vec<Define>;
  fn get_uniforms(&self) -> Vec<Uniform>;
}
