use generational_arena::Index;
use log::info;
use na::{Point2, Point3, Vector3};
use ncollide3d::procedural::{IndexBuffer, TriMesh};
use ncollide3d::shape::{Ball, Cuboid};
use ncollide3d::transformation::ToTriMesh;
use std::slice;

use super::context::{BufferItem, BufferTarget, BufferUsage};
use super::renderer::{Accessor, Attributes, Geometry, Mesh, Primitive, Renderer};
use super::shader::{AttributeName, AttributeOptions};

impl Renderer {
  pub fn bake_buffer_accessor<T: BufferItem>(
    &mut self,
    target: BufferTarget,
    data: &[T],
    item_size: i32,
    count: i32,
  ) -> Index {
    let buffer = self.insert_buffer(target, BufferUsage::StaticDraw, data);
    let attribute_options = AttributeOptions::new(T::array_kind(), item_size);
    let accessor = Accessor {
      buffer,
      count,
      options: attribute_options,
    };

    self.insert_accessor(accessor)
  }

  pub fn bake_tri_mesh_geometry(&mut self, mut tri_mesh: TriMesh<f32>) -> Index {
    tri_mesh.unify_index_buffer();

    let mut attributes = Attributes::new();

    attributes.insert(
      AttributeName::Position,
      self.bake_buffer_accessor(
        BufferTarget::ArrayBuffer,
        flatten_points3_f32(&tri_mesh.coords),
        3,
        tri_mesh.coords.len() as i32,
      ),
    );

    if let Some(normals) = &tri_mesh.normals {
      attributes.insert(
        AttributeName::Normal,
        self.bake_buffer_accessor(
          BufferTarget::ArrayBuffer,
          flatten_vectors3_f32(normals),
          3,
          normals.len() as i32,
        ),
      );
    }

    if let Some(uv) = &tri_mesh.uvs {
      attributes.insert(
        AttributeName::Uv,
        self.bake_buffer_accessor(
          BufferTarget::ArrayBuffer,
          flatten_points2_f32(uv),
          2,
          uv.len() as i32,
        ),
      );
    }

    let indices = match &tri_mesh.indices {
      IndexBuffer::Unified(indices) => self.bake_buffer_accessor(
        BufferTarget::ElementArrayBuffer,
        flatten_points3_u32(indices),
        1,
        indices.len() as i32 * 3,
      ),
      IndexBuffer::Split(_) => panic!("unable to render split indices"),
    };

    self.insert_geometry(Geometry {
      attributes,
      indices: Some(indices),
    })
  }

  pub fn bake_tri_mesh(
    &mut self,
    tri_mesh: TriMesh<f32>,
    material: Option<Index>,
    name: Option<String>,
  ) -> Index {
    let geometry = self.bake_tri_mesh_geometry(tri_mesh);

    let primitive = Primitive { geometry, material };

    self.insert_mesh(Mesh {
      primitives: vec![primitive],
      name,
    })
  }

  pub fn bake_cuboid_mesh(
    &mut self,
    half_extents: Vector3<f32>,
    material_handle: Option<Index>,
    name: Option<String>,
  ) -> Index {
    let cuboid: TriMesh<f32> = Cuboid::new(half_extents).to_trimesh(());

    self.bake_tri_mesh(cuboid, material_handle, name)
  }

  pub fn bake_ball_mesh(
    &mut self,
    radius: f32,
    material_handle: Option<Index>,
    name: Option<String>,
  ) -> Index {
    let ball: TriMesh<f32> = Ball::new(radius).to_trimesh((32, 32));

    self.bake_tri_mesh(ball, material_handle, name)
  }
}

fn flatten_points3_f32(points: &[Point3<f32>]) -> &[f32] {
  let len = points.len() * 3;
  let ptr = points.as_ptr();

  unsafe { slice::from_raw_parts(ptr as *const f32, len) }
}

fn flatten_points2_f32(points: &[Point2<f32>]) -> &[f32] {
  let len = points.len() * 2;
  let ptr = points.as_ptr();

  unsafe { slice::from_raw_parts(ptr as *const f32, len) }
}

fn flatten_points3_u32(points: &[Point3<u32>]) -> &[u32] {
  let len = points.len() * 3;
  let ptr = points.as_ptr();

  unsafe { slice::from_raw_parts(ptr as *const u32, len) }
}

fn flatten_vectors3_f32(vectors: &[Vector3<f32>]) -> &[f32] {
  let len = vectors.len() * 3;
  let ptr = vectors.as_ptr();

  unsafe { slice::from_raw_parts(ptr as *const f32, len) }
}
