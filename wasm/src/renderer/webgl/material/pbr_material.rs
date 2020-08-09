use na::{Matrix4, Vector3, U3};

use anyhow::Result;

use super::material::Material;
use crate::renderer::webgl::context::{Context, DrawMode, Feature};
use crate::renderer::webgl::renderer::Camera;
use crate::renderer::webgl::shader::Shader;
use crate::scene::node::Node;

#[derive(Debug)]
pub struct PbrMaterial {
  color: Vector3<f32>,
  cull_face: bool,
  depth_test: bool,
  draw_mode: DrawMode,
}

impl PbrMaterial {
  pub fn new() -> Self {
    PbrMaterial {
      color: Vector3::new(0.0, 0.0, 0.0),
      cull_face: true,
      depth_test: true,
      draw_mode: DrawMode::Triangles,
    }
  }

  pub fn set_color(mut self, color: Vector3<f32>) -> Self {
    self.color = color;
    self
  }

  pub fn set_cull_face(mut self, cull_face: bool) -> Self {
    self.cull_face = cull_face;
    self
  }

  pub fn set_depth_test(mut self, depth_test: bool) -> Self {
    self.depth_test = depth_test;
    self
  }

  pub fn set_draw_mode(mut self, draw_mode: DrawMode) -> Self {
    self.draw_mode = draw_mode;
    self
  }

  pub fn boxed(self) -> Box<Self> {
    Box::new(self)
  }
}

impl Material for PbrMaterial {
  fn get_tag(&self) -> String {
    String::from("pbr")
  }

  fn create_shader(&self, ctx: &Context) -> Result<Shader> {
    let vert_src = include_str!("./shaders/pbr_vert.glsl");
    let frag_src = include_str!("./shaders/pbr_frag.glsl");

    ctx.create_shader(vert_src, frag_src, &vec![])
  }

  fn setup_context(&self, ctx: &Context, shader: &Shader, node: &Node, camera: &Camera) {
    shader.set_vector3("color", &self.color);
    shader.set_matrix4("projectionMatrix", &camera.projection);
    shader.set_matrix4("viewMatrix", &camera.view);
    shader.set_matrix4("modelMatrix", &node.matrix_world);
    shader.set_matrix3(
      "normalMatrix",
      &node
        .matrix_world
        .try_inverse()
        .unwrap_or_else(|| Matrix4::identity())
        .transpose()
        .fixed_slice::<U3, U3>(0, 0)
        .into(),
    );

    ctx.set(Feature::CullFace, self.cull_face);
    ctx.set(Feature::DepthTest, self.depth_test);
  }

  fn draw_mode(&self) -> DrawMode {
    self.draw_mode
  }
}
