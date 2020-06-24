use anyhow::Result;
use generational_arena::{Arena, Index};
use log::info;
use na::{Matrix4, U3};
use std::collections::HashMap;
use web_sys::WebGlBuffer;

use super::camera::CameraState;
use super::context::{
  BufferItem, BufferTarget, BufferUsage, Context, DrawMode, Feature, TypedArrayKind,
};
use super::geometry::Geometry;
use super::material::{Material, PBRMaterialParams};
use super::mesh::Meshes;
use super::shader::Shader;
use crate::scene::node::Node;
use crate::scene::scene::Scene;

pub struct Renderer {
  ctx: Context,
  buffers: Arena<WebGlBuffer>,
  shaders: HashMap<String, Shader>,
}

impl Renderer {
  pub fn new(ctx: Context) -> Renderer {
    let buffers = Arena::new();
    let shaders = HashMap::new();
    Renderer {
      ctx,
      buffers,
      shaders,
    }
  }

  pub fn set_size(&self, width: i32, height: i32) {
    self.ctx.viewport(0, 0, width, height)
  }

  pub fn set_clear_color(&self, r: f32, g: f32, b: f32, a: f32) {
    self.ctx.clear_color(r, g, b, a);
  }

  pub fn clear(&self, color: bool, depth: bool) {
    self.ctx.clear(color, depth);
  }

  pub fn create_buffer<T: BufferItem>(
    &mut self,
    target: BufferTarget,
    usage: BufferUsage,
    data: &[T],
  ) -> Index {
    let buffer = self.ctx.create_buffer(target, usage, data).unwrap();

    self.buffers.insert(buffer)
  }

  pub fn render(
    &mut self,
    root_handle: Index,
    scene: &mut Scene,
    meshes: &Meshes,
    camera_state: &CameraState,
  ) -> Result<()> {
    scene.update_matrix_world();

    let visible_items = scene.collect_visible_sub_items(root_handle);

    for handle in visible_items {
      let node = scene.get_node(handle).unwrap();
      let mesh = meshes.get(node.mesh.unwrap()).unwrap();

      for primitive in &mesh.primitives {
        let geometry = &primitive.geometry;
        let material = &primitive.material;
        match material {
          Material::PBR(params) => self.setup_pbr_material(node, params, geometry, camera_state)?,
        };
        self.draw_geometry(DrawMode::Triangles, geometry);
      }
    }

    Ok(())
  }

  fn draw_geometry(&self, mode: DrawMode, geometry: &Geometry) {
    if let Some(index_attribute) = &geometry.indices {
      let indices = self.buffers.get(index_attribute.buffer).unwrap();
      self
        .ctx
        .bind_buffer(BufferTarget::ElementArrayBuffer, Some(indices));
      self
        .ctx
        .draw_elements(mode, geometry.count, TypedArrayKind::Uint16, 0);
    } else {
      self.ctx.draw_arrays(mode, 0, geometry.count);
    }
  }

  fn bind_geometry(&self, shader: &Shader, geometry: &Geometry) {
    let mut attr_amount = 0;

    for name in shader.get_attribute_locations().keys() {
      if let Some(attribute) = geometry.attributes.get(name) {
        let buffer = self.buffers.get(attribute.buffer).unwrap();
        self
          .ctx
          .bind_buffer(BufferTarget::ArrayBuffer, Some(buffer));
        shader.bind_attribute(name, &attribute.options);
      }

      attr_amount += 1;
    }

    self.ctx.switch_attributes(attr_amount);
  }

  fn setup_pbr_material(
    &mut self,
    node: &Node,
    params: &PBRMaterialParams,
    geometry: &Geometry,
    camera_state: &CameraState,
  ) -> Result<()> {
    let tag = "pbr";

    if self.shaders.get(tag).is_none() {
      let vert_src = include_str!("./shaders/pbr_vert.glsl");
      let frag_src = include_str!("./shaders/pbr_frag.glsl");

      self.shaders.insert(
        tag.to_string(),
        self.ctx.create_shader(vert_src, frag_src, &vec![])?,
      );
    };

    let shader = self.shaders.get(tag).unwrap();

    shader.bind();

    shader.set_vector3("color", &params.color);
    shader.set_matrix4("projectionMatrix", &camera_state.projection);
    shader.set_matrix4("viewMatrix", &camera_state.view);
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

    self.bind_geometry(shader, geometry);

    self.ctx.enable(Feature::CullFace);
    self.ctx.enable(Feature::DepthTest);

    Ok(())
  }
}
