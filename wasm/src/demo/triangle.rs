use super::canvas::Canvas;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct TriangleDemo {
  canvas: Canvas,
}

#[wasm_bindgen]
impl TriangleDemo {
  #[wasm_bindgen(constructor)]
  pub fn new() -> StdResult<TriangleDemo, JsValue> {
    let canvas = Canvas::new()?;

    Ok(TriangleDemo { canvas })
  }

  pub fn update(&mut self) {
    self.canvas.check_size();
  }
}
