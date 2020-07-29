use anyhow::Result;
use generational_arena::Index;
use log::info;
use na::{Matrix4, U3};

use super::context::{BufferTarget, Context, DrawMode, Feature, TypedArrayKind};
use super::shader::Shader;
use super::store::{Attributes, Camera, Indices, Material, PBRMaterialParams, RenderStore};
use crate::scene::node::Node;

pub fn get_pbr_material_tag(_params: &PBRMaterialParams) -> String {
  String::from("pbr")
}

pub fn get_material_tag(material: &Material) -> String {
  match material {
    Material::PBR(params) => get_pbr_material_tag(params),
  }
}

pub fn get_shader(ctx: &Context, material: &Material) -> Result<Shader> {
  match material {
    Material::PBR(_params) => {
      let vert_src = include_str!("./shaders/pbr_vert.glsl");
      let frag_src = include_str!("./shaders/pbr_frag.glsl");

      ctx.create_shader(vert_src, frag_src, &vec![])
    }
  }
}

pub fn checkup_shader(store: &mut RenderStore, material: &Material) -> Result<()> {
  let tag = get_material_tag(material);

  if store.shaders.get(&tag).is_none() {
    store
      .shaders
      .insert(tag.clone(), get_shader(&store.ctx, material)?);
  };

  Ok(())
}

pub fn render_scene(store: &RenderStore, root_handle: Index, camera_handle: Index) {
  let visible_items = store.scene.collect_visible_sub_items(root_handle);
  let camera = store.cameras.get(camera_handle).unwrap();

  for handle in visible_items {
    let node = store.scene.get_node(handle).unwrap();
    let mesh = store.meshes.get(node.mesh.unwrap()).unwrap();

    for primitive in &mesh.primitives {
      if let Some(material_handle) = primitive.material {
        let material = store.materials.get(material_handle).unwrap();

        match material {
          Material::PBR(params) => draw_call_pbr(
            store,
            node,
            &params,
            &primitive.attributes,
            &primitive.indices,
            camera,
          ),
        };
      }
    }
  }
}

pub fn draw_call_pbr(
  store: &RenderStore,
  node: &Node,
  material_params: &PBRMaterialParams,
  attributes: &Attributes,
  indices: &Indices,
  camera: &Camera,
) {
  let tag = get_pbr_material_tag(material_params);

  let shader = store.shaders.get(&tag).unwrap();

  shader.bind();

  shader.set_vector3("color", &material_params.color);
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

  store.ctx.enable(Feature::CullFace);
  store.ctx.enable(Feature::DepthTest);

  draw_call(
    &store.ctx,
    store,
    DrawMode::Triangles,
    shader,
    attributes,
    indices,
  );
}

fn draw_call(
  ctx: &Context,
  store: &RenderStore,
  mode: DrawMode,
  shader: &Shader,
  attributes: &Attributes,
  indices: &Indices,
) {
  let mut attr_amount = 0;
  let mut count = 0;

  for name in shader.get_attribute_locations().keys() {
    if let Some(accessor_handle) = attributes.get(name) {
      let accessor = store.accessors.get(*accessor_handle).unwrap();
      let buffer = store.buffers.get(accessor.buffer).unwrap();
      ctx.bind_buffer(BufferTarget::ArrayBuffer, Some(buffer));
      shader.bind_attribute(name, &accessor.options);

      count = accessor.count;
    }

    attr_amount += 1;
  }

  ctx.switch_attributes(attr_amount);

  if let Some(accessor_handle) = indices {
    let accessor = store.accessors.get(*accessor_handle).unwrap();
    let indices = store.buffers.get(accessor.buffer).unwrap();
    count = accessor.count;
    ctx.bind_buffer(BufferTarget::ElementArrayBuffer, Some(indices));
    ctx.draw_elements(mode, count, TypedArrayKind::Uint16, 0);
  } else {
    ctx.draw_arrays(mode, 0, count);
  }
}
