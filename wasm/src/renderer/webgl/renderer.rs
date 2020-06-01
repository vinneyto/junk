use generational_arena::{Arena, Index};
use na::{Matrix4, Vector3};
use std::collections::HashMap;
use web_sys::{WebGlBuffer, WebGlRenderingContext, WebGlTexture};

use super::context::{BufferTarget, Context};
use super::material::material::Material;
use super::material::material_params::MaterialParams;
use super::shader::{AttributeOptions, Shader};
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
  pub count: u32,
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub geometry: Geometry,
  pub material: Material,
}

pub struct CameraState {
  pub view: Matrix4<f32>,
  pub projection: Matrix4<f32>,
}

pub struct Renderer {
  ctx: Context,
  buffers: Arena<WebGlBuffer>,
  textures: Arena<WebGlTexture>,
  shaders: HashMap<String, Shader>,
}

impl Renderer {
  pub fn new(gl: WebGlRenderingContext) -> Renderer {
    let ctx = Context::new(gl);
    let buffers = Arena::new();
    let textures = Arena::new();
    let shaders = HashMap::new();
    Renderer {
      ctx,
      buffers,
      textures,
      shaders,
    }
  }

  pub fn render(&mut self, scene: &mut Scene, meshes: &Arena<Mesh>, camera_state: &CameraState) {
    scene.update_world_isometry();

    let visible_items = scene.collect_visible_items();

    for handle in visible_items {
      let node = scene.get_node(handle).unwrap();
      let mesh = meshes.get(node.mesh.unwrap()).unwrap();

      let shader_id = match &mesh.material {
        Material::Debug(debug_params) => self.setup_mesh_shader(debug_params),
      };

      self.bind_geometry(&shader_id, &mesh.geometry);
    }
  }

  fn setup_mesh_shader<T: MaterialParams>(&mut self, params: &T) -> String {
    todo!("later")
  }

  fn bind_geometry(&self, shader_id: &str, geometry: &Geometry) {
    let shader = self.shaders.get(shader_id).unwrap();

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
}
