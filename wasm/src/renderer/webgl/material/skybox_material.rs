use generational_arena::Index;
use na::Matrix4;

use anyhow::Result;

use super::material::{bind_several_maps, Material, MaterialParams};
use crate::renderer::webgl::context::{Context, DepthFunc, DrawMode, TextureKind};
use crate::renderer::webgl::renderer::{Camera, Images, Samplers, Textures};
use crate::renderer::webgl::shader::Shader;
use crate::scene::node::Node;

#[derive(Debug)]
pub struct SkyboxMaterial {
  skybox: Index,
}

impl SkyboxMaterial {
  pub fn new(skybox: Index) -> Self {
    SkyboxMaterial { skybox }
  }

  pub fn boxed(self) -> Box<Self> {
    Box::new(self)
  }
}

impl Material for SkyboxMaterial {
  fn get_tag(&self) -> String {
    String::from("skybox")
  }

  fn create_shader(&self, ctx: &Context) -> Result<Shader> {
    let vert_src = include_str!("./shaders/skybox_vert.glsl");
    let frag_src = include_str!("./shaders/skybox_frag.glsl");

    ctx.create_shader(vert_src, frag_src, &[])
  }

  fn setup_shader(
    &self,
    ctx: &Context,
    images: &Images,
    textures: &Textures,
    samplers: &Samplers,
    shader: &Shader,
    _node: &Node,
    camera: &Camera,
  ) {
    let mut view_without_translation = camera.view;

    view_without_translation[12] = 0.0;
    view_without_translation[13] = 0.0;
    view_without_translation[14] = 0.0;

    let view_direction_projection_inverse = (camera.projection * view_without_translation)
      .try_inverse()
      .unwrap_or_else(|| Matrix4::identity());

    shader.set_matrix4(
      "viewDirectionProjectionInverse",
      &view_direction_projection_inverse,
    );

    bind_several_maps(
      ctx,
      images,
      textures,
      samplers,
      shader,
      &[(Some(self.skybox), TextureKind::CubeMap, "skybox")],
    );
  }

  fn params(&self) -> MaterialParams {
    MaterialParams {
      cull_face: true,
      depth_test: true,
      depth_func: DepthFunc::Lequal,
      draw_mode: DrawMode::Triangles,
    }
  }
}
