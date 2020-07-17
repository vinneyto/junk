use anyhow::Result;
use generational_arena::Index;
use log::info;
use na::{Matrix4, U3};
use std::collections::HashMap;

use super::camera::CameraState;
use super::context::{BufferTarget, Context, DrawMode, Feature, TypedArrayKind};
use super::mesh::{
  Accessors, Attributes, Buffers, Indices, Material, Materials, Meshes, PBRMaterialParams,
};
use super::shader::Shader;
use crate::scene::node::Node;
use crate::scene::scene::Scene;

#[derive(Debug, Default)]
pub struct RenderDataBase {
  pub buffers: Buffers,
  pub accessors: Accessors,
  pub materials: Materials,
  pub meshes: Meshes,
  pub scene: Scene,
}

impl RenderDataBase {
  pub fn new() -> Self {
    Self::default()
  }
}

pub struct Renderer {
  shaders: HashMap<String, Shader>,
}

impl Renderer {
  pub fn new() -> Renderer {
    let shaders = HashMap::new();

    Renderer { shaders }
  }

  pub fn render(
    &mut self,
    ctx: &Context,
    db: &RenderDataBase,
    root_handle: Index,
    camera_state: &CameraState,
  ) -> Result<()> {
    let visible_items = db.scene.collect_visible_sub_items(root_handle);

    for handle in visible_items {
      let node = db.scene.get_node(handle).unwrap();
      let mesh = db.meshes.get(node.mesh.unwrap()).unwrap();

      for primitive in &mesh.primitives {
        if let Some(material_handle) = primitive.material {
          let material = db.materials.get(material_handle).unwrap();

          match material {
            Material::PBR(params) => self.draw_call_pbr(
              ctx,
              db,
              node,
              &params,
              &primitive.attributes,
              &primitive.indices,
              camera_state,
            )?,
          };
        }
      }
    }

    Ok(())
  }

  fn draw_call_pbr(
    &mut self,
    ctx: &Context,
    db: &RenderDataBase,
    node: &Node,
    material_params: &PBRMaterialParams,
    attributes: &Attributes,
    indices: &Indices,
    camera_state: &CameraState,
  ) -> Result<()> {
    let tag = "pbr";

    if self.shaders.get(tag).is_none() {
      let vert_src = include_str!("./shaders/pbr_vert.glsl");
      let frag_src = include_str!("./shaders/pbr_frag.glsl");

      self.shaders.insert(
        tag.to_string(),
        ctx.create_shader(vert_src, frag_src, &vec![])?,
      );
    };

    let shader = self.shaders.get(tag).unwrap();

    shader.bind();

    shader.set_vector3("color", &material_params.color);
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

    ctx.enable(Feature::CullFace);
    ctx.enable(Feature::DepthTest);

    draw_call(ctx, db, DrawMode::Triangles, shader, attributes, indices);

    Ok(())
  }
}

fn draw_call(
  ctx: &Context,
  db: &RenderDataBase,
  mode: DrawMode,
  shader: &Shader,
  attributes: &Attributes,
  indices: &Indices,
) {
  let mut attr_amount = 0;
  let mut count = 0;

  for name in shader.get_attribute_locations().keys() {
    if let Some(accessor_handle) = attributes.get(name) {
      let accessor = db.accessors.get(*accessor_handle).unwrap();
      let buffer = db.buffers.get(accessor.buffer).unwrap();
      ctx.bind_buffer(BufferTarget::ArrayBuffer, Some(buffer));
      shader.bind_attribute(name, &accessor.options);

      count = accessor.count;
    }

    attr_amount += 1;
  }

  ctx.switch_attributes(attr_amount);

  if let Some(accessor_handle) = indices {
    let accessor = db.accessors.get(*accessor_handle).unwrap();
    let indices = db.buffers.get(accessor.buffer).unwrap();
    count = accessor.count;
    ctx.bind_buffer(BufferTarget::ElementArrayBuffer, Some(indices));
    ctx.draw_elements(mode, count, TypedArrayKind::Uint16, 0);
  } else {
    ctx.draw_arrays(mode, 0, count);
  }
}
