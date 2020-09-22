use generational_arena::Index;

use crate::renderer::webgl::context::{Context, DepthFunc, DrawMode, TextureKind};
use crate::renderer::webgl::renderer::{Camera, Images, Samplers, Textures};
use crate::renderer::webgl::shader::Shader;
use crate::scene::node::Node;
use anyhow::Result;
use std::fmt::Debug;

pub struct MaterialParams {
  pub cull_face: bool,
  pub depth_test: bool,
  pub depth_func: DepthFunc,
  pub draw_mode: DrawMode,
}

pub trait Material: Debug {
  fn get_tag(&self) -> String;
  fn create_shader(&self, ctx: &Context) -> Result<Shader>;
  fn setup_shader(
    &self,
    ctx: &Context,
    images: &Images,
    textures: &Textures,
    samplers: &Samplers,
    shader: &Shader,
    node: &Node,
    camera: &Camera,
  );
  fn params(&self) -> MaterialParams;
}

pub fn bind_several_maps(
  ctx: &Context,
  images: &Images,
  textures: &Textures,
  samplers: &Samplers,
  shader: &Shader,
  maps: &[(Option<Index>, TextureKind, &str)],
) {
  for (i, map) in maps.iter().enumerate() {
    if let Some(map_handle) = map.0 {
      bind_texture(
        ctx, images, textures, samplers, shader, map_handle, map.1, map.2, i as u32,
      );
    }
  }
}

pub fn bind_texture(
  ctx: &Context,
  images: &Images,
  textures: &Textures,
  samplers: &Samplers,
  shader: &Shader,
  texture_handle: Index,
  texture_kind: TextureKind,
  uniform_name: &str,
  unit: u32,
) {
  let texture = textures.get(texture_handle).unwrap();
  let image = images.get(texture.source).unwrap();
  let sampler = samplers.get(texture.sampler).unwrap();

  ctx.active_texture(unit);
  ctx.bind_texture(texture_kind, Some(&image));

  sampler.set_params(texture_kind, ctx);

  shader.set_integer(uniform_name, unit as i32);
}
