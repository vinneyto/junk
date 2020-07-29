use generational_arena::Index;
use gltf::Gltf;
use log::info;
use na::Matrix4;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use crate::renderer::webgl::context::Context;
use crate::renderer::webgl::gltf::bake_gltf;
use crate::renderer::webgl::render::render_scene;
use crate::renderer::webgl::store::{Camera, RenderStore};

use super::webgl_canvas::WebGlCanvas;

#[wasm_bindgen]
pub struct GLTFRendererDemo {
  store: RenderStore,
  root_handle: Index,
  camera_handle: Index,
  canvas: WebGlCanvas,
}

#[wasm_bindgen]
impl GLTFRendererDemo {
  #[wasm_bindgen(constructor)]
  pub fn new(gltf_data: &[u8]) -> StdResult<GLTFRendererDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let gltf = Gltf::from_slice(gltf_data).unwrap();

    let mut store = RenderStore::new(ctx);

    let camera_handle = store.cameras.insert(Camera::default());

    let handles = bake_gltf(&gltf, &mut store).unwrap();

    // info!("handles {:#?}", handles);
    // info!("store {:#?}", store);

    Ok(GLTFRendererDemo {
      root_handle: handles[0],
      camera_handle,
      canvas,
      store,
    })
  }

  pub fn update(&mut self, view_data: &[f32], projection_data: &[f32]) {
    if self.canvas.check_size() {
      self
        .store
        .ctx
        .viewport(0, 0, self.canvas.width as i32, self.canvas.height as i32);
    }

    self.store.ctx.clear_color(1.0, 1.0, 1.0, 1.0);
    self.store.ctx.clear(true, true);

    let camera = self.store.cameras.get_mut(self.camera_handle).unwrap();

    camera.view = Matrix4::from_vec(view_data.to_vec());
    camera.projection = Matrix4::from_vec(projection_data.to_vec());

    self.store.scene.update_matrix_world();

    render_scene(&self.store, self.root_handle, self.camera_handle);
  }
}
