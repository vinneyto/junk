use anyhow::Result;
use generational_arena::{Arena, Index};
use na::{Matrix4, Vector3};
use std::collections::HashMap;
use web_sys::WebGlBuffer;

use super::context::{BufferItem, BufferTarget, BufferUsage, Context, DrawMode, TypedArrayKind};
use super::shader::{AttributeOptions, Shader};
use crate::scene::node::Node;
use crate::scene::scene::Scene;

#[derive(Debug, Clone)]
pub struct Attribute {
  pub buffer: Index,
  pub options: AttributeOptions,
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum AttributeName {
  Position,
  Normal,
  Uv,
  Unknown(String),
}

impl AttributeName {
  pub fn from_string(name: &str) -> Self {
    match name {
      "position" => AttributeName::Position,
      "normal" => AttributeName::Normal,
      "uv" => AttributeName::Uv,
      _ => panic!("unknown attribute {}", name),
    }
  }
}

#[derive(Debug, Clone)]
pub struct Geometry {
  pub attributes: HashMap<AttributeName, Attribute>,
  pub indices: Option<Attribute>,
  pub count: i32,
}

#[derive(Debug, Clone)]
pub struct PBRMaterialParams {
  pub color: Vector3<f32>,
}

#[derive(Debug, Clone)]
pub enum Material {
  PBR(PBRMaterialParams),
}

#[derive(Debug, Clone)]
pub struct Primitive {
  pub geometry: Geometry,
  pub material: Material,
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub primitives: Vec<Primitive>,
  pub name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct CameraState {
  view: Matrix4<f32>,
  projection: Matrix4<f32>,
}

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
    scene: &mut Scene,
    meshes: &Arena<Mesh>,
    camera_state: &CameraState,
  ) -> Result<()> {
    scene.update_world_isometry();

    let visible_items = scene.collect_visible_items();

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
    self.ctx.switch_attributes(geometry.attributes.len() as u32);

    for name in shader.get_attribute_locations().keys() {
      let attribute_name = AttributeName::from_string(name);
      if let Some(attribute) = geometry.attributes.get(&attribute_name) {
        let buffer = self.buffers.get(attribute.buffer).unwrap();
        self
          .ctx
          .bind_buffer(BufferTarget::ArrayBuffer, Some(buffer));
        shader.bind_attribute(name, &attribute.options);
      }
    }
  }

  fn setup_pbr_material(
    &mut self,
    node: &Node,
    params: &PBRMaterialParams,
    geometry: &Geometry,
    _camera_state: &CameraState,
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
    shader.set_matrix4("modelMatrix", &node.isometry.to_homogeneous());

    self.bind_geometry(shader, geometry);

    Ok(())
  }
}
