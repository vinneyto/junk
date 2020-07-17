use generational_arena::Index;
use gltf::Gltf;
use log::info;
use na::Matrix4;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use crate::renderer::webgl::camera::CameraState;
use crate::renderer::webgl::context::Context;
use crate::renderer::webgl::gltf_util::bake_gltf;
use crate::renderer::webgl::renderer::{RenderDataBase, Renderer};

use super::webgl_canvas::WebGlCanvas;

#[wasm_bindgen]
pub struct GLTFRendererDemo {
  ctx: Context,
  renderer: Renderer,
  db: RenderDataBase,
  root_handle: Index,
  canvas: WebGlCanvas,
}

#[wasm_bindgen]
impl GLTFRendererDemo {
  #[wasm_bindgen(constructor)]
  pub fn new(gltf_data: &[u8]) -> StdResult<GLTFRendererDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let renderer = Renderer::new();
    let gltf = Gltf::from_slice(gltf_data).unwrap();

    let mut db = RenderDataBase::new();

    let handles = bake_gltf(&gltf, &ctx, &mut db);

    // info!("handles {:#?}", handles);
    // info!("db {:#?}", db);

    Ok(GLTFRendererDemo {
      root_handle: handles[0],
      renderer,
      canvas,
      ctx,
      db,
    })
  }

  pub fn update(&mut self, view_data: &[f32], projection_data: &[f32]) {
    if self.canvas.check_size() {
      self
        .ctx
        .viewport(0, 0, self.canvas.width as i32, self.canvas.height as i32);
    }

    self.ctx.clear_color(1.0, 1.0, 1.0, 1.0);
    self.ctx.clear(true, true);

    let camera_state = CameraState {
      view: Matrix4::from_vec(view_data.to_vec()),
      projection: Matrix4::from_vec(projection_data.to_vec()),
    };

    self.db.scene.update_matrix_world();

    self
      .renderer
      .render(&self.ctx, &self.db, self.root_handle, &camera_state)
      .unwrap();
  }
}
