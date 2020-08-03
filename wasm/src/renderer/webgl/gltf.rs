use generational_arena::Index;
use gltf::accessor::DataType;
use gltf::mesh::Semantic;
use gltf::scene::Transform;
use gltf::Gltf;
use na::{Quaternion, UnitQuaternion, Vector3, Vector4};
use std::collections::HashMap;

use crate::scene::node::Node;

use super::context::{BufferTarget, BufferUsage, TypedArrayKind};
use super::renderer::{Accessor, Material, Mesh, PBRMaterialParams, Primitive, Renderer};
use super::shader::{AttributeName, AttributeOptions};

pub type IndexMap = HashMap<usize, Index>;

impl Renderer {
  pub fn create_gltf_accessors(&mut self, gltf: &Gltf) -> IndexMap {
    let mut buffer_index = IndexMap::new();
    let mut accessor_index = IndexMap::new();

    for accessor_def in gltf.accessors() {
      if accessor_def.sparse().is_some() {
        todo!("sparse");
      }

      let accessor_handle = if let Some(view_def) = accessor_def.view() {
        let view_index = view_def.index();
        let blob = gltf.blob.as_ref().unwrap();

        let buffer_handle = if let Some(handle) = buffer_index.get(&view_index) {
          *handle
        } else {
          let offset = view_def.offset();
          let length = view_def.length();

          let data = &blob[offset..(offset + length)];
          let acc_idx = accessor_def.index();
          let is_index_buffer = gltf
            .meshes()
            .find(|m| {
              m.primitives()
                .find(|p| match p.indices() {
                  Some(acc) => acc.index() == acc_idx,
                  None => false,
                })
                .is_some()
            })
            .is_some();
          let buffer_target = if is_index_buffer {
            BufferTarget::ElementArrayBuffer
          } else {
            BufferTarget::ArrayBuffer
          };
          let handle = self.insert_buffer(buffer_target, BufferUsage::StaticDraw, data);
          buffer_index.insert(view_index, handle);

          handle
        };

        self.accessors.insert(Accessor {
          buffer: buffer_handle,
          count: accessor_def.count() as i32,
          options: AttributeOptions {
            component_type: match accessor_def.data_type() {
              DataType::U8 => TypedArrayKind::Uint8,
              DataType::I8 => TypedArrayKind::Int8,
              DataType::I16 => TypedArrayKind::Int16,
              DataType::U16 => TypedArrayKind::Uint16,
              DataType::U32 => TypedArrayKind::Uint32,
              DataType::F32 => TypedArrayKind::Float32,
            },
            item_size: accessor_def.dimensions().multiplicity() as i32,
            normalized: accessor_def.normalized(),
            stride: view_def.stride().unwrap_or(0) as i32,
            offset: accessor_def.offset() as i32,
          },
        })
      } else {
        self.accessors.insert(Accessor {
          buffer: Index::from_raw_parts(0, 0),
          count: 0,
          options: AttributeOptions {
            component_type: TypedArrayKind::Float32,
            item_size: 3,
            normalized: false,
            stride: 0,
            offset: 0,
          },
        })
      };

      accessor_index.insert(accessor_def.index(), accessor_handle);
    }

    accessor_index
  }

  pub fn create_gltf_materials(&mut self, gltf: &Gltf) -> IndexMap {
    let mut material_index = IndexMap::new();

    for material_def in gltf.materials() {
      let material_handle = self.insert_material(Material::PBR(PBRMaterialParams {
        color: Vector3::new(0.0, 0.0, 0.0),
      }));

      material_index.insert(material_def.index().unwrap(), material_handle);
    }

    material_index
  }

  pub fn create_gltf_meshes(
    &mut self,
    gltf: &Gltf,
    accessor_index: &IndexMap,
    materials_index: &IndexMap,
  ) -> IndexMap {
    let mut mesh_index = IndexMap::new();

    for mesh_def in gltf.meshes() {
      let mut primitives: Vec<Primitive> = vec![];

      for primitive_def in mesh_def.primitives() {
        let mut attributes: HashMap<AttributeName, Index> = HashMap::new();

        for (semantic_def, accessor_def) in primitive_def.attributes() {
          let attr_name = match semantic_def {
            Semantic::Positions => AttributeName::Position,
            Semantic::Normals => AttributeName::Normal,
            Semantic::TexCoords(value) => match value {
              0 => AttributeName::Uv,
              _ => AttributeName::Custom(semantic_def.to_string()),
            },
            _ => AttributeName::Custom(semantic_def.to_string()),
          };
          attributes.insert(
            attr_name,
            *accessor_index.get(&accessor_def.index()).unwrap(),
          );
        }

        let indices;

        if let Some(indices_accessor) = primitive_def.indices() {
          indices = accessor_index.get(&indices_accessor.index()).cloned();
        } else {
          indices = None;
        }

        let material;

        if let Some(index) = primitive_def.material().index() {
          material = materials_index.get(&index).cloned();
        } else {
          material = None;
        }

        primitives.push(Primitive {
          attributes,
          indices,
          material,
        });
      }

      let mesh_handle = self.meshes.insert(Mesh {
        primitives,
        name: mesh_def.name().map(|n| n.to_string()),
      });

      mesh_index.insert(mesh_def.index(), mesh_handle);
    }

    mesh_index
  }

  pub fn create_gltf_nodes(&mut self, gltf: &Gltf, mesh_index: &IndexMap) -> IndexMap {
    let mut node_index = IndexMap::new();

    let nodes: Vec<Node> = gltf
      .nodes()
      .map(|node_def| {
        let mut node = Node::new(None);

        match node_def.transform() {
          Transform::Decomposed {
            translation,
            rotation,
            scale,
          } => {
            node.position = Vector3::from_vec(translation.to_vec());
            node.rotation = UnitQuaternion::from_quaternion(Quaternion::from(Vector4::from_vec(
              rotation.to_vec(),
            )));
            node.scale = Vector3::from_vec(scale.to_vec());
          }
          Transform::Matrix { matrix: _ } => todo!("matrix transform"),
        };

        if let Some(mesh_def) = node_def.mesh() {
          node.mesh = mesh_index.get(&mesh_def.index()).cloned();
        }

        node.name = node_def.name().map(|n| n.to_string());

        node
      })
      .collect();

    for (index, node) in nodes.iter().enumerate() {
      let handle = self.scene.insert(node.clone());

      node_index.insert(index, handle);
    }

    for node_def in gltf.nodes() {
      for child_def in node_def.children() {
        let child_handle = node_index.get(&child_def.index()).unwrap();
        let parent_handle = node_index.get(&node_def.index()).unwrap();

        self.scene.set_parent(*child_handle, *parent_handle);
      }
    }

    node_index
  }

  pub fn create_gltf_scenes(&mut self, gltf: &Gltf, node_index: &IndexMap) -> Vec<Index> {
    gltf
      .scenes()
      .map(|scene_def| {
        let scene_handle = self.scene.insert(Node::new(None));

        for node_def in scene_def.nodes() {
          let node_handle = *node_index.get(&node_def.index()).unwrap();
          self.scene.set_parent(node_handle, scene_handle);
        }

        scene_handle
      })
      .collect()
  }

  pub fn bake_gltf(&mut self, gltf: &Gltf) -> Vec<Index> {
    let accessor_index = self.create_gltf_accessors(gltf);
    let material_index = self.create_gltf_materials(gltf);
    let mesh_index = self.create_gltf_meshes(gltf, &accessor_index, &material_index);
    let node_index = self.create_gltf_nodes(gltf, &mesh_index);

    self.create_gltf_scenes(gltf, &node_index)
  }
}
