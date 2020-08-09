use generational_arena::Index;
use na::{Matrix4, Vector2, Vector3, U3};

use anyhow::Result;

use super::material::Material;
use crate::renderer::webgl::context::{Context, DrawMode, Feature, TextureKind};
use crate::renderer::webgl::define::Define;
use crate::renderer::webgl::renderer::{Camera, Renderer};
use crate::renderer::webgl::shader::Shader;
use crate::scene::node::Node;

#[derive(Debug)]
pub struct PbrMaterial {
  color: Vector3<f32>,
  color_map: Option<Index>,
  uv_repeating: Vector2<f32>,
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
      color_map: None,
      uv_repeating: Vector2::new(1.0, 1.0),
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

  pub fn set_color_map(mut self, color_map: Option<Index>) -> Self {
    self.color_map = color_map;
    self
  }

  pub fn set_uv_repeating(mut self, uv_repeating: Vector2<f32>) -> Self {
    self.uv_repeating = uv_repeating;
    self
  }

  pub fn boxed(self) -> Box<Self> {
    Box::new(self)
  }
}

impl Material for PbrMaterial {
  fn get_tag(&self) -> String {
    let mut tag = String::from("pbr");

    if self.color_map.is_some() {
      tag.push_str(":color_map");
    }

    tag
  }

  fn create_shader(&self, ctx: &Context) -> Result<Shader> {
    let vert_src = include_str!("./shaders/pbr_vert.glsl");
    let frag_src = include_str!("./shaders/pbr_frag.glsl");

    let mut defines = vec![];

    if self.color_map.is_some() {
      defines.push(Define::def("USE_COLOR_MAP"));
    }

    ctx.create_shader(vert_src, frag_src, &defines)
  }

  fn setup_shader(&self, renderer: &Renderer, shader: &Shader, node: &Node, camera: &Camera) {
    let ctx = &renderer.ctx;

    shader.set_vector3("color", &self.color);
    shader.set_vector2("uvRepeating", &self.uv_repeating);
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

    if let Some(color_map) = self.color_map {
      bind_texture(renderer, shader, color_map, "colorMap", 0);
    }

    ctx.set(Feature::CullFace, self.cull_face);
    ctx.set(Feature::DepthTest, self.depth_test);
  }

  fn draw_mode(&self) -> DrawMode {
    self.draw_mode
  }
}

fn bind_texture(
  renderer: &Renderer,
  shader: &Shader,
  texture_handle: Index,
  uniform_name: &str,
  unit: u32,
) {
  let texture = renderer.textures.get(texture_handle).unwrap();
  let image = renderer.images.get(texture.source).unwrap();
  let sampler = renderer.samplers.get(texture.sampler).unwrap();
  let ctx = &renderer.ctx;

  ctx.active_texture(unit);
  ctx.bind_texture(TextureKind::Texture2d, Some(&image));

  sampler.set_params(ctx);

  shader.set_integer(uniform_name, unit as i32);
}
