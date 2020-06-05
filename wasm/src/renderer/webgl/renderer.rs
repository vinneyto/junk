use anyhow::Result;
use generational_arena::{Arena, Index};
use na::{Matrix4, Vector3};
use std::collections::HashMap;
use web_sys::{WebGlBuffer, WebGlRenderingContext};

use super::context::{BufferItem, BufferTarget, BufferUsage, Context, DrawMode, TypedArrayKind};
use super::shader::{AttributeOptions, Shader};
use crate::scene::node::Node;
use crate::scene::scene::Scene;

#[derive(Debug, Clone)]
pub struct Attribute {
  pub buffer: Index,
  pub options: AttributeOptions,
}

#[derive(Debug, Clone)]
pub struct Geometry {
  pub attributes: HashMap<String, Attribute>,
  pub indices: Option<Index>,
  pub count: i32,
}

#[derive(Debug, Clone)]
pub struct DebugMaterialParams {
  pub color: Vector3<f32>,
}

#[derive(Debug, Clone)]
pub enum Material {
  Debug(DebugMaterialParams),
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub geometry: Geometry,
  pub material: Material,
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
  pub fn new(gl: WebGlRenderingContext) -> Renderer {
    let ctx = Context::new(gl);
    let buffers = Arena::new();
    let shaders = HashMap::new();
    Renderer {
      ctx,
      buffers,
      shaders,
    }
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
      let geometry = &mesh.geometry;
      let material = &mesh.material;

      match material {
        Material::Debug(params) => {
          self.setup_debug_material(node, params, geometry, camera_state)?
        }
      };

      if let Some(index_handle) = &geometry.indices {
        let indices = self.buffers.get(*index_handle).unwrap();
        self
          .ctx
          .bind_buffer(BufferTarget::ElementArrayBuffer, Some(indices));
        self.ctx.draw_elements(
          DrawMode::Triangles,
          geometry.count,
          TypedArrayKind::Uint16,
          0,
        );
      } else {
        self.ctx.draw_arrays(DrawMode::Triangles, 0, geometry.count);
      }
    }

    Ok(())
  }

  fn bind_geometry(&self, shader: &Shader, geometry: &Geometry) {
    self.ctx.switch_attributes(geometry.attributes.len() as u32);

    for name in shader.get_attribute_locations().keys() {
      if let Some(attribute) = geometry.attributes.get(name) {
        let buffer = self.buffers.get(attribute.buffer).unwrap();
        self
          .ctx
          .bind_buffer(BufferTarget::ArrayBuffer, Some(buffer));
        shader.bind_attribute(name, &attribute.options);
      }
    }
  }

  fn setup_debug_material(
    &mut self,
    node: &Node,
    params: &DebugMaterialParams,
    geometry: &Geometry,
    _camera_state: &CameraState,
  ) -> Result<()> {
    let tag = "debug";

    if self.shaders.get(tag).is_none() {
      let vert_src = include_str!("./shaders/debug_vert.glsl");
      let frag_src = include_str!("./shaders/debug_frag.glsl");

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
