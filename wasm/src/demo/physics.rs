use js_sys::Float32Array;
use na::Vector3;
use ncollide3d::shape::{Cuboid, ShapeHandle};
use nphysics3d::force_generator::DefaultForceGeneratorSet;
use nphysics3d::joint::DefaultJointConstraintSet;
use nphysics3d::object::{
  BodyPartHandle, ColliderDesc, DefaultBodyHandle, DefaultBodySet, DefaultColliderSet, Ground,
  RigidBodyDesc,
};
use nphysics3d::world::{DefaultGeometricalWorld, DefaultMechanicalWorld};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

use crate::renderer::webgl::context::get_typed_array_from_slice;

#[wasm_bindgen]
pub struct PhysicsDemo {
  render_data: Vec<f32>,
  game_objects: Vec<Box<dyn GameObject>>,

  mechanical_world: DefaultMechanicalWorld<f32>,
  geometrical_world: DefaultGeometricalWorld<f32>,
  bodies: DefaultBodySet<f32>,
  colliders: DefaultColliderSet<f32>,
  joint_constraints: DefaultJointConstraintSet<f32>,
  force_generators: DefaultForceGeneratorSet<f32>,
}

#[wasm_bindgen]
impl PhysicsDemo {
  #[wasm_bindgen(constructor)]
  pub fn new() -> PhysicsDemo {
    let render_data = vec![0.0; 100];
    let mut game_objects: Vec<Box<dyn GameObject>> = vec![];

    let mechanical_world = DefaultMechanicalWorld::new(Vector3::new(0.0, -9.81, 0.0));
    let geometrical_world = DefaultGeometricalWorld::new();

    let mut bodies = DefaultBodySet::new();
    let mut colliders = DefaultColliderSet::new();
    let joint_constraints = DefaultJointConstraintSet::new();
    let force_generators = DefaultForceGeneratorSet::new();

    let ground_thickness = 0.2;
    let ground_shape = ShapeHandle::new(Cuboid::new(Vector3::new(5.0, ground_thickness, 5.0)));

    let ground_handle = bodies.insert(Ground::new());
    let co = ColliderDesc::new(ground_shape)
      .translation(Vector3::y() * -ground_thickness)
      .build(BodyPartHandle(ground_handle, 0));
    colliders.insert(co);

    game_objects.push(Box::new(CuboidObject::new(
      &mut bodies,
      &mut colliders,
      Vector3::new(0.5, 0.5, 0.5),
      Vector3::new(0.0, 2.0, 0.0),
    )));

    game_objects.push(Box::new(CuboidObject::new(
      &mut bodies,
      &mut colliders,
      Vector3::new(0.5, 0.5, 0.5),
      Vector3::new(0.7, 4.0, 0.0),
    )));

    game_objects.push(Box::new(CuboidObject::new(
      &mut bodies,
      &mut colliders,
      Vector3::new(0.5, 0.5, 0.5),
      Vector3::new(-0.7, 4.0, 0.0),
    )));

    game_objects.push(Box::new(CuboidObject::new(
      &mut bodies,
      &mut colliders,
      Vector3::new(0.3, 0.5, 0.7),
      Vector3::new(-0.7, 6.0, -1.0),
    )));

    game_objects.push(Box::new(CuboidObject::new(
      &mut bodies,
      &mut colliders,
      Vector3::new(0.3, 0.5, 0.7),
      Vector3::new(-0.2, 8.0, 1.0),
    )));

    PhysicsDemo {
      render_data,
      game_objects,
      mechanical_world,
      geometrical_world,
      bodies,
      colliders,
      joint_constraints,
      force_generators,
    }
  }

  pub fn step(&mut self) {
    self.mechanical_world.step(
      &mut self.geometrical_world,
      &mut self.bodies,
      &mut self.colliders,
      &mut self.joint_constraints,
      &mut self.force_generators,
    )
  }

  pub fn get_amount(&self) -> u32 {
    self.game_objects.len() as u32
  }

  pub fn get_render_data(&mut self, index: usize) -> Float32Array {
    self.game_objects[index].update_render_data(&self.colliders, &mut self.render_data);

    get_typed_array_from_slice(&self.render_data)
      .dyn_into::<Float32Array>()
      .unwrap_or_else(|_| panic!("array is not Float32Array"))
  }
}

pub trait GameObject {
  fn update_render_data(&self, colliders: &DefaultColliderSet<f32>, data: &mut [f32]);
}

pub struct CuboidObject {
  handle: DefaultBodyHandle,
  half_size: Vector3<f32>,
}

impl CuboidObject {
  pub fn new(
    bodies: &mut DefaultBodySet<f32>,
    colliders: &mut DefaultColliderSet<f32>,
    half_size: Vector3<f32>,
    translation: Vector3<f32>,
  ) -> Self {
    let body = RigidBodyDesc::new().translation(translation).build();

    let handle = bodies.insert(body);

    let cuboid = ShapeHandle::new(Cuboid::new(half_size));

    let co = ColliderDesc::new(cuboid)
      .density(1.0)
      .build(BodyPartHandle(handle, 0));
    colliders.insert(co);

    CuboidObject { handle, half_size }
  }
}

impl GameObject for CuboidObject {
  fn update_render_data(&self, bodies: &DefaultColliderSet<f32>, data: &mut [f32]) {
    if let Some(collider) = bodies.get(self.handle) {
      let m = collider.position().to_homogeneous();
      for i in 0..16 {
        data[i] = m[i];
      }
      data[16] = self.half_size.x * 2.0;
      data[17] = self.half_size.y * 2.0;
      data[18] = self.half_size.z * 2.0;
    }
  }
}
