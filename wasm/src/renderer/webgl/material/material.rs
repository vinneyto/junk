use crate::renderer::webgl::context::{Context, DrawMode};
use crate::renderer::webgl::renderer::Camera;
use crate::renderer::webgl::shader::Shader;
use crate::scene::node::Node;
use anyhow::Result;
use std::fmt::Debug;

pub trait Material: Debug {
  fn get_tag(&self) -> String;
  fn create_shader(&self, ctx: &Context) -> Result<Shader>;
  fn setup_context(&self, ctx: &Context, shader: &Shader, node: &Node, camera: &Camera);
  fn draw_mode(&self) -> DrawMode;
}
