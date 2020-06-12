use gltf::Gltf;
use log::info;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use crate::renderer::webgl::context::Context;
use crate::renderer::webgl::gltf_util::create_gltf_attributes;
use crate::renderer::webgl::renderer::Renderer;

use super::webgl_canvas::WebGlCanvas;

#[wasm_bindgen]
pub struct GLTFRendererDemo {
  renderer: Renderer,
  canvas: WebGlCanvas,
}

#[wasm_bindgen]
impl GLTFRendererDemo {
  #[wasm_bindgen(constructor)]
  pub fn new(gltf_data: &[u8]) -> StdResult<GLTFRendererDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let mut renderer = Renderer::new(ctx);
    let gltf = Gltf::from_slice(gltf_data).unwrap();

    let attributes = create_gltf_attributes(&gltf, &mut renderer);

    info!("{:#?}", attributes);

    Ok(GLTFRendererDemo { renderer, canvas })
  }

  pub fn update(&mut self) {
    if self.canvas.check_size() {
      self
        .renderer
        .set_size(self.canvas.width as i32, self.canvas.height as i32);
    }

    self.renderer.set_clear_color(1.0, 1.0, 1.0, 1.0);
    self.renderer.clear(true, true);
  }
}
