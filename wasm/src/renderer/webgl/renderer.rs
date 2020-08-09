use generational_arena::{Arena, Index};
use log::info;
use na::Matrix4;
use std::collections::HashMap;
use std::default::Default;
use web_sys::{WebGlBuffer, WebGlTexture};

use super::context::{
  BufferItem, BufferTarget, BufferUsage, Context, TexParam, TexParamName, TextureKind,
};
use super::material::Material;
use super::shader::Shader;

use super::shader::{AttributeName, AttributeOptions};
use crate::scene::node::Node;
use crate::scene::scene::Scene;

#[derive(Debug, Clone)]
pub struct Accessor {
  pub buffer: Index,
  pub count: i32,
  pub options: AttributeOptions,
}

pub type Attributes = HashMap<AttributeName, Index>;
pub type Indices = Option<Index>;

#[derive(Debug, Clone)]
pub struct Geometry {
  pub attributes: Attributes,
  pub indices: Indices,
}

#[derive(Debug, Clone)]
pub struct Primitive {
  pub geometry: Index,
  pub material: Option<Index>,
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub primitives: Vec<Primitive>,
  pub name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct Sampler {
  pub mag_filter: TexParam,
  pub min_filter: TexParam,
  pub wrap_s: TexParam,
  pub wrap_t: TexParam,
}

impl Default for Sampler {
  fn default() -> Self {
    Sampler {
      wrap_s: TexParam::ClampToEdge,
      wrap_t: TexParam::ClampToEdge,
      min_filter: TexParam::LinearMipMapLinear,
      mag_filter: TexParam::Linear,
    }
  }
}

impl Sampler {
  pub fn set_params(&self, ctx: &Context) {
    ctx.texture_parameter(
      TextureKind::Texture2d,
      TexParamName::TextureMinFilter,
      self.min_filter,
    );
    ctx.texture_parameter(
      TextureKind::Texture2d,
      TexParamName::TextureMagFilter,
      self.mag_filter,
    );
    ctx.texture_parameter(
      TextureKind::Texture2d,
      TexParamName::TextureWrapS,
      self.wrap_s,
    );
    ctx.texture_parameter(
      TextureKind::Texture2d,
      TexParamName::TextureWrapT,
      self.wrap_t,
    );
  }
}

#[derive(Debug, Clone)]
pub struct Texture {
  pub source: Index,
  pub sampler: Index,
}

#[derive(Debug, Clone)]
pub struct Camera {
  pub view: Matrix4<f32>,
  pub projection: Matrix4<f32>,
}

impl Default for Camera {
  fn default() -> Self {
    Camera {
      view: Matrix4::identity(),
      projection: Matrix4::identity(),
    }
  }
}

impl Camera {
  pub fn new(view: Matrix4<f32>, projection: Matrix4<f32>) -> Self {
    Camera { view, projection }
  }
}

pub type Buffers = Arena<WebGlBuffer>;
pub type Images = Arena<WebGlTexture>;
pub type Accessors = Arena<Accessor>;
pub type Geometries = Arena<Geometry>;
pub type Materials = Arena<Box<dyn Material>>;
pub type Samplers = Arena<Sampler>;
pub type Textures = Arena<Texture>;
pub type Meshes = Arena<Mesh>;
pub type Cameras = Arena<Camera>;
pub type Shaders = HashMap<String, Shader>;

pub struct Renderer {
  pub ctx: Context,
  pub buffers: Buffers,
  pub images: Images,
  pub accessors: Accessors,
  pub geometries: Geometries,
  pub materials: Materials,
  pub samplers: Samplers,
  pub textures: Textures,
  pub meshes: Meshes,
  pub cameras: Cameras,
  pub scene: Scene,
  pub shaders: Shaders,
}

impl Renderer {
  pub fn new(ctx: Context) -> Self {
    ctx.get_extension("OES_element_index_uint").unwrap();

    Renderer {
      ctx,
      buffers: Buffers::default(),
      images: Images::default(),
      accessors: Accessors::default(),
      geometries: Geometries::default(),
      materials: Materials::default(),
      samplers: Samplers::default(),
      textures: Textures::default(),
      meshes: Meshes::default(),
      cameras: Cameras::default(),
      scene: Scene::new(),
      shaders: HashMap::new(),
    }
  }

  pub fn checkup_shader(&mut self, material: &Box<dyn Material>) {
    let tag = material.get_tag();

    if self.shaders.get(&tag).is_none() {
      info!("compile shader: {}", tag);

      self
        .shaders
        .insert(tag.clone(), material.create_shader(&self.ctx).unwrap());
    };
  }

  pub fn insert_buffer<T: BufferItem>(
    &mut self,
    target: BufferTarget,
    usage: BufferUsage,
    data: &[T],
  ) -> Index {
    self
      .buffers
      .insert(self.ctx.create_buffer(target, usage, data).unwrap())
  }

  pub fn insert_material(&mut self, material: Box<dyn Material>) -> Index {
    self.checkup_shader(&material);

    self.materials.insert(material)
  }

  pub fn insert_node(&mut self, node: Node) -> Index {
    self.scene.insert(node)
  }

  pub fn insert_mesh(&mut self, mesh: Mesh) -> Index {
    self.meshes.insert(mesh)
  }

  pub fn insert_accessor(&mut self, accessor: Accessor) -> Index {
    self.accessors.insert(accessor)
  }

  pub fn insert_geometry(&mut self, geometry: Geometry) -> Index {
    self.geometries.insert(geometry)
  }

  pub fn insert_image(&mut self, image: WebGlTexture) -> Index {
    self.images.insert(image)
  }

  pub fn insert_sampler(&mut self, sampler: Sampler) -> Index {
    self.samplers.insert(sampler)
  }

  pub fn insert_texture(&mut self, texture: Texture) -> Index {
    self.textures.insert(texture)
  }

  pub fn render_scene(&self, root_handle: Index, camera_handle: Index) {
    let visible_items = self.scene.collect_visible_sub_items(root_handle);
    let camera = self.cameras.get(camera_handle).unwrap();

    for handle in visible_items {
      let node = self.scene.get_node(handle).unwrap();
      let mesh = self.meshes.get(node.mesh.unwrap()).unwrap();

      for primitive in &mesh.primitives {
        if let Some(material_handle) = primitive.material {
          let geometry = self.geometries.get(primitive.geometry).unwrap();
          let material = self.materials.get(material_handle).unwrap();

          self.draw_call(geometry, material, node, camera);
        }
      }
    }
  }

  pub fn draw_call(
    &self,
    geometry: &Geometry,
    material: &Box<dyn Material>,
    node: &Node,
    camera: &Camera,
  ) {
    let tag = material.get_tag();

    let shader = self.shaders.get(&tag).unwrap();

    shader.bind();

    material.setup_shader(&self, shader, node, camera);

    let mut attr_amount = 0;
    let mut count = 0;
    let mode = material.draw_mode();

    for name in shader.get_attribute_locations().keys() {
      if let Some(accessor_handle) = geometry.attributes.get(name) {
        let accessor = self.accessors.get(*accessor_handle).unwrap();
        let buffer = self.buffers.get(accessor.buffer).unwrap();
        self
          .ctx
          .bind_buffer(BufferTarget::ArrayBuffer, Some(buffer));
        shader.bind_attribute(name, &accessor.options);

        count = accessor.count;
      }

      attr_amount += 1;
    }

    self.ctx.switch_attributes(attr_amount);

    if let Some(accessor_handle) = geometry.indices {
      let accessor = self.accessors.get(accessor_handle).unwrap();
      let indices = self.buffers.get(accessor.buffer).unwrap();
      count = accessor.count;
      self
        .ctx
        .bind_buffer(BufferTarget::ElementArrayBuffer, Some(indices));
      self
        .ctx
        .draw_elements(mode, count, accessor.options.component_type, 0);
    } else {
      self.ctx.draw_arrays(mode, 0, count);
    }
  }
}
