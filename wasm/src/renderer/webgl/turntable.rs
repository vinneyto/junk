use generational_arena::Index;
use na::{Isometry3, Point2, Point3, Vector3};
use std::f32::consts::PI;

use super::renderer::Renderer;

pub struct Turntable {
  pub roll: f32,
  pub pitch: f32,
  pub radius: f32,
  pub center: Vector3<f32>,
  pub cursor_position: Point2<f32>,
  pub sensitivity: f32,
}

impl Turntable {
  pub fn new(radius: f32, sensitivity: f32) -> Self {
    Turntable {
      roll: 0.0,
      pitch: 0.0,
      center: Vector3::new(0.0, 0.0, 0.0),
      cursor_position: Point2::new(0.0, 0.0),
      sensitivity,
      radius,
    }
  }

  pub fn start(&mut self, cursor_position: Point2<f32>) {
    self.cursor_position = cursor_position;
  }

  pub fn rotate(&mut self, cursor_position: Point2<f32>) {
    let round = PI * 2.0;
    let bound = PI / 2.0;

    let delta = cursor_position - self.cursor_position;

    let roll = self.roll + delta.y * self.sensitivity;
    let pitch = self.pitch - delta.x * self.sensitivity;

    self.roll = bound.min((-bound).max(roll % round));
    self.pitch = pitch % round;

    self.cursor_position = cursor_position;
  }

  pub fn update_camera(&self, renderer: &mut Renderer, camera_handle: Index) {
    let r = self.radius;

    let position = Point3::new(
      r * self.roll.cos().abs() * self.pitch.sin(),
      r * self.roll.sin(),
      r * self.roll.cos().abs() * self.pitch.cos(),
    ) + self.center;

    let view =
      Isometry3::look_at_rh(&position, &Point3::from(self.center), &Vector3::y()).to_homogeneous();

    let camera = renderer.cameras.get_mut(camera_handle).unwrap();

    camera.view = view;
  }
}
