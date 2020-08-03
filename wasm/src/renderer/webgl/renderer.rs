use anyhow::Result;
use generational_arena::{Arena, Index};
use log::info;
use na::{Matrix4, Vector3, U3};
use std::collections::HashMap;
use std::default::Default;
use web_sys::WebGlBuffer;

use super::context::{BufferItem, BufferTarget, BufferUsage, Context, DrawMode, Feature};
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
pub struct Primitive {
  pub attributes: Attributes,
  pub indices: Indices,
  pub material: Option<Index>,
}

#[derive(Debug, Clone)]
pub struct Mesh {
  pub primitives: Vec<Primitive>,
  pub name: Option<String>,
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
pub type Accessors = Arena<Accessor>;
pub type Materials = Arena<Material>;
pub type Meshes = Arena<Mesh>;
pub type Cameras = Arena<Camera>;
pub type Shaders = HashMap<String, Shader>;

pub struct Renderer {
  pub ctx: Context,
  pub buffers: Buffers,
  pub accessors: Accessors,
  pub materials: Materials,
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
      accessors: Accessors::default(),
      materials: Materials::default(),
      meshes: Meshes::default(),
      cameras: Cameras::default(),
      scene: Scene::new(),
      shaders: HashMap::new(),
    }
  }

  pub fn checkup_shader(&mut self, material: &Material) {
    let tag = get_material_tag(material);

    if self.shaders.get(&tag).is_none() {
      self
        .shaders
        .insert(tag.clone(), get_shader(&self.ctx, material).unwrap());
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

  pub fn insert_material(&mut self, material: Material) -> Index {
    self.checkup_shader(&material);

    self.materials.insert(material)
  }

  pub fn insert_node(&mut self, node: Node) -> Index {
    self.scene.insert(node)
  }

  pub fn insert_accessor(&mut self, accessor: Accessor) -> Index {
    self.accessors.insert(accessor)
  }

  pub fn render_scene(&self, root_handle: Index, camera_handle: Index) {
    let visible_items = self.scene.collect_visible_sub_items(root_handle);
    let camera = self.cameras.get(camera_handle).unwrap();

    for handle in visible_items {
      let node = self.scene.get_node(handle).unwrap();
      let mesh = self.meshes.get(node.mesh.unwrap()).unwrap();

      for primitive in &mesh.primitives {
        if let Some(material_handle) = primitive.material {
          let material = self.materials.get(material_handle).unwrap();

          match material {
            Material::PBR(params) => self.draw_call_pbr(
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
    &self,
    node: &Node,
    material_params: &PBRMaterialParams,
    attributes: &Attributes,
    indices: &Indices,
    camera: &Camera,
  ) {
    let tag = get_pbr_material_tag(material_params);

    let shader = self.shaders.get(&tag).unwrap();

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

    self.ctx.enable(Feature::CullFace);
    self.ctx.enable(Feature::DepthTest);

    self.draw_call(DrawMode::Triangles, shader, attributes, indices);
  }

  pub fn draw_call(
    &self,
    mode: DrawMode,
    shader: &Shader,
    attributes: &Attributes,
    indices: &Indices,
  ) {
    let mut attr_amount = 0;
    let mut count = 0;

    for name in shader.get_attribute_locations().keys() {
      if let Some(accessor_handle) = attributes.get(name) {
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

    if let Some(accessor_handle) = indices {
      let accessor = self.accessors.get(*accessor_handle).unwrap();
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
