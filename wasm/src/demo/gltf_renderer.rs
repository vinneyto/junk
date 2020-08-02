use generational_arena::Index;
use gltf::Gltf;
use log::info;
use na::Point2;
use std::f32::consts::PI;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use crate::renderer::webgl::context::Context;
use crate::renderer::webgl::renderer::{Camera, Renderer};
use crate::renderer::webgl::turntable::Turntable;

use super::webgl_canvas::WebGlCanvas;

#[wasm_bindgen]
pub struct GLTFRendererDemo {
  renderer: Renderer,
  root_handle: Index,
  camera_handle: Index,
  canvas: WebGlCanvas,
  turntable: Turntable,
}

#[wasm_bindgen]
impl GLTFRendererDemo {
  #[wasm_bindgen(constructor)]
  pub fn new(gltf_data: &[u8]) -> StdResult<GLTFRendererDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let gltf = Gltf::from_slice(gltf_data).unwrap();
    let turntable = Turntable::new(10.0, 0.01);

    let mut renderer = Renderer::new(ctx);

    let camera_handle = renderer.cameras.insert(Camera::default());

    let handles = renderer.bake_gltf(&gltf);

    // info!("handles {:#?}", handles);
    // info!("renderer {:#?}", renderer);

    Ok(GLTFRendererDemo {
      root_handle: handles[0],
      camera_handle,
      canvas,
      renderer,
      turntable,
    })
  }

  pub fn start_interaction(&mut self, x: f32, y: f32) {
    self.turntable.start(Point2::new(x, y));
  }

  pub fn interact(&mut self, x: f32, y: f32) {
    self.turntable.rotate(Point2::new(x, y));
  }

  pub fn update(&mut self) {
    if self.canvas.check_size() {
      self
        .renderer
        .ctx
        .viewport(0, 0, self.canvas.width as i32, self.canvas.height as i32);
    }

    self.renderer.ctx.clear_color(1.0, 1.0, 1.0, 1.0);
    self.renderer.ctx.clear(true, true);

    self.renderer.scene.update_matrix_world();

    let aspect = self.canvas.width as f32 / self.canvas.height as f32;
    let fovy = 75.0 / 180.0 * PI;
    let near = 0.01;
    let far = 30.0;

    self
      .renderer
      .make_perspective_camera(self.camera_handle, aspect, fovy, near, far);

    self
      .turntable
      .update_camera(&mut self.renderer, self.camera_handle);

    self
      .renderer
      .render_scene(self.root_handle, self.camera_handle);
  }
}
