use generational_arena::Index;
use na::{Matrix4, Perspective3};

use super::renderer::Renderer;

impl Renderer {
  pub fn update_camera(
    &mut self,
    handle: Index,
    view: Option<Matrix4<f32>>,
    projection: Option<Matrix4<f32>>,
  ) {
    let camera = self.cameras.get_mut(handle).unwrap();

    if let Some(v) = view {
      camera.view = v;
    }

    if let Some(p) = projection {
      camera.projection = p;
    }
  }

  pub fn make_perspective_camera(
    &mut self,
    handle: Index,
    aspect: f32,
    fovy: f32,
    near: f32,
    far: f32,
  ) {
    let perspective = Perspective3::new(aspect, fovy, near, far);

    self.update_camera(handle, None, Some(perspective.to_homogeneous()))
  }
}
