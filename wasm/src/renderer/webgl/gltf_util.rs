use generational_arena::Index;
use gltf::accessor::DataType;
use gltf::mesh::Semantic;
use gltf::scene::Transform;
use gltf::Gltf;
use na::{Quaternion, UnitQuaternion, Vector3, Vector4};
use std::collections::HashMap;

use crate::scene::node::Node;
use crate::scene::scene::Scene;

use super::context::{BufferTarget, BufferUsage, TypedArrayKind};
use super::geometry::{Attribute, AttributeName, Geometry};
use super::material::{Material, PBRMaterialParams};
use super::mesh::{Mesh, Meshes, Primitive};
use super::renderer::Renderer;
use super::shader::AttributeOptions;

pub fn create_gltf_attributes(gltf: &Gltf, renderer: &mut Renderer) -> Vec<Attribute> {
  let mut attributes: Vec<Attribute> = vec![];
  let mut buffer_indices: HashMap<usize, Index> = HashMap::new();

  for accessor_def in gltf.accessors() {
    if accessor_def.sparse().is_some() {
      panic!("sparse is not supported");
    }

    if let Some(view_def) = accessor_def.view() {
      let view_index = view_def.index();
      let blob = gltf.blob.as_ref().unwrap();

      let buffer_handle = if let Some(handle) = buffer_indices.get(&view_index) {
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
        let handle = renderer.create_buffer(buffer_target, BufferUsage::StaticDraw, data);
        buffer_indices.insert(view_index, handle);

        handle
      };

      attributes.push(Attribute {
        buffer: buffer_handle,
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
      });
    } else {
      attributes.push(Attribute {
        buffer: Index::from_raw_parts(0, 0),
        options: AttributeOptions {
          component_type: TypedArrayKind::Float32,
          item_size: 3,
          normalized: false,
          stride: 0,
          offset: 0,
        },
      });
    }
  }

  attributes
}

pub fn create_gltf_meshes(gltf: &Gltf, attribute_list: &[Attribute]) -> Vec<Mesh> {
  let mut meshes: Vec<Mesh> = vec![];

  for mesh_def in gltf.meshes() {
    let mut primitives: Vec<Primitive> = vec![];

    for primitive_def in mesh_def.primitives() {
      let mut attributes: HashMap<AttributeName, Attribute> = HashMap::new();
      let mut count = 0;

      for (semantic_def, accessor_def) in primitive_def.attributes() {
        let attr_name = match semantic_def {
          Semantic::Positions => AttributeName::Position,
          Semantic::Normals => AttributeName::Normal,
          Semantic::TexCoords(value) => match value {
            0 => AttributeName::Uv,
            _ => AttributeName::Unknown(semantic_def.to_string()),
          },
          _ => AttributeName::Unknown(semantic_def.to_string()),
        };
        attributes.insert(attr_name, attribute_list[accessor_def.index()].clone());

        count = accessor_def.count() as i32;
      }

      let indices;

      if let Some(indices_accessor) = primitive_def.indices() {
        indices = Some(attribute_list[indices_accessor.index()].clone());
        count = indices_accessor.count() as i32;
      } else {
        indices = None;
      }

      let geometry = Geometry {
        attributes,
        indices,
        count,
      };

      let material = Material::PBR(PBRMaterialParams {
        color: Vector3::new(0.0, 0.0, 0.0),
      });

      primitives.push(Primitive { geometry, material });
    }

    meshes.push(Mesh {
      primitives,
      name: mesh_def.name().map(|n| n.to_string()),
    });
  }

  meshes
}

pub fn create_gltf_scenes(
  gltf: &Gltf,
  renderer: &mut Renderer,
  scene: &mut Scene,
  meshes: &mut Meshes,
) -> Vec<Index> {
  let attribute_list = create_gltf_attributes(gltf, renderer);
  let meshes_list = create_gltf_meshes(gltf, &attribute_list);
  let mut meshes_index: HashMap<usize, Index> = HashMap::new();
  let mut nodes_index: HashMap<usize, Index> = HashMap::new();

  for (index, mesh) in meshes_list.iter().enumerate() {
    let mesh_handle = meshes.insert(mesh.clone());

    meshes_index.insert(index, mesh_handle);
  }

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
          node.rotation =
            UnitQuaternion::from_quaternion(Quaternion::from(Vector4::from_vec(rotation.to_vec())));
          node.scale = Vector3::from_vec(scale.to_vec());
        }
        Transform::Matrix { matrix: _ } => todo!("matrix transform"),
      };

      if let Some(mesh_def) = node_def.mesh() {
        node.mesh = meshes_index.get(&mesh_def.index()).cloned();
      }

      node.name = node_def.name().map(|n| n.to_string());

      node
    })
    .collect();

  for (index, node) in nodes.iter().enumerate() {
    let handle = scene.insert(node.clone());

    nodes_index.insert(index, handle);
  }

  gltf.nodes().for_each(|node_def| {
    for child_def in node_def.children() {
      let child_handle = nodes_index.get(&child_def.index()).unwrap();
      let parent_handle = nodes_index.get(&node_def.index()).unwrap();

      scene.set_parent(*child_handle, *parent_handle);
    }
  });

  gltf
    .scenes()
    .map(|scene_def| {
      let scene_handle = scene.insert(Node::new(None));

      for node_def in scene_def.nodes() {
        let node_handle = *nodes_index.get(&node_def.index()).unwrap();
        scene.set_parent(node_handle, scene_handle);
      }

      scene_handle
    })
    .collect()
}
