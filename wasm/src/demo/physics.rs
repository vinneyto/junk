use js_sys::Float32Array;
use na::Vector3;
use nphysics3d::force_generator::DefaultForceGeneratorSet;
use nphysics3d::joint::DefaultJointConstraintSet;
use nphysics3d::object::{DefaultBodySet, DefaultColliderSet};
use nphysics3d::world::{DefaultGeometricalWorld, DefaultMechanicalWorld};
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

use crate::renderer::webgl::context::get_typed_array_from_slice;

#[wasm_bindgen]
pub struct PhysicsDemo {
  render_data: Vec<f32>,
  positions: Vec<Vector3<f32>>,
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
    let positions = vec![Vector3::new(0.0, 0.0, 0.0); 5];

    let mechanical_world = DefaultMechanicalWorld::new(Vector3::new(0.0, -9.81, 0.0));
    let geometrical_world = DefaultGeometricalWorld::new();

    let bodies = DefaultBodySet::new();
    let colliders = DefaultColliderSet::new();
    let joint_constraints = DefaultJointConstraintSet::new();
    let force_generators = DefaultForceGeneratorSet::new();

    PhysicsDemo {
      render_data,
      positions,
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
    self.positions.len() as u32
  }

  pub fn get_object_data(&mut self, index: usize) -> Float32Array {
    update_render_data(&mut self.render_data, &self.positions[index]);

    get_typed_array_from_slice(&self.render_data)
      .dyn_into::<Float32Array>()
      .unwrap_or_else(|_| panic!("array is not Float32Array"))
  }
}

fn update_render_data(data: &mut [f32], position: &Vector3<f32>) {
  data[0] = position.x;
  data[1] = position.y;
  data[2] = position.z;
}
