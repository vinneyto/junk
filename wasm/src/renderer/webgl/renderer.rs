use anyhow::Result;
use generational_arena::{Arena, Index};
use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use web_sys::{WebGlBuffer, WebGlRenderingContext};

use super::context::{BufferItem, BufferTarget, BufferUsage, Context, DrawMode, TypedArrayKind};
use super::material::material::Material;
use super::material::material_params::{CameraState, MaterialParams, Uniform};
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
  pub count: i32,
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub geometry: Geometry,
  pub material: Material,
}

pub struct Renderer {
  ctx: Context,
  buffers: Arena<WebGlBuffer>,
  shaders: Rc<RefCell<HashMap<String, Shader>>>,
}

impl Renderer {
  pub fn new(gl: WebGlRenderingContext) -> Renderer {
    let ctx = Context::new(gl);
    let buffers = Arena::new();
    let shaders = Rc::new(RefCell::new(HashMap::new()));
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
    &self,
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
        Material::Debug(debug_params) => {
          self.setup_mesh_shader(debug_params, geometry, camera_state)?
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

  fn setup_mesh_shader<T: MaterialParams>(
    &self,
    material_params: &T,
    geometry: &Geometry,
    camera_state: &CameraState,
  ) -> Result<()> {
    let tag = material_params.get_tag();

    if self.shaders.borrow().get(&tag).is_none() {
      let defines = material_params.get_defines();
      let (vertex_src, fragment_src) = material_params.get_shader_src();
      let shader = self
        .ctx
        .create_shader(&vertex_src, &fragment_src, &defines)?;
      self.shaders.borrow_mut().insert(tag.clone(), shader);
    }

    if let Some(shader) = self.shaders.borrow().get(&tag) {
      shader.bind();

      for uniform in material_params.get_uniforms(camera_state) {
        match uniform {
          Uniform::Float { name, value } => shader.set_float(&name, value),
          Uniform::Vector3 { name, value } => shader.set_vector3(&name, &value),
          Uniform::Matrix4 { name, value } => shader.set_matrix4(&name, &value),
        };
      }

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

    Ok(())
  }
}
