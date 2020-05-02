use super::canvas::Canvas;
use crate::renderer::context::Context;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct TriangleDemo {
  canvas: Canvas,
  ctx: Context,
}

#[wasm_bindgen]
impl TriangleDemo {
  #[wasm_bindgen(constructor)]
  pub fn new() -> StdResult<TriangleDemo, JsValue> {
    let canvas = Canvas::new()?;
    let ctx = Context::new(canvas.gl.clone());

    Ok(TriangleDemo { canvas, ctx })
  }

  pub fn update(&mut self) {
    self.canvas.check_size();
  }
}
