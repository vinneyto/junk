use na::Vector3;

use super::material_params::{MaterialParams, Uniform};
use crate::renderer::webgl::define::Define;

#[derive(Debug, Clone)]
pub struct DebugMaterialParams {
  pub color: Vector3<f32>,
}

impl MaterialParams for DebugMaterialParams {
  fn get_tag(&self) -> String {
    String::from("debug")
  }

  fn get_shader_src(&self) -> (String, String) {
    (String::from(""), String::from(""))
  }

  fn get_defines(&self) -> Vec<Define> {
    vec![]
  }

  fn get_uniforms(&self) -> Vec<Uniform> {
    let color_uniform = Uniform::Vector3 {
      name: "color".to_string(),
      value: self.color,
    };

    vec![color_uniform]
  }
}
