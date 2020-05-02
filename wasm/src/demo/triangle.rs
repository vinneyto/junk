use super::canvas::Canvas;
use crate::renderer::context::Context;
use crate::renderer::shader::Shader;
use anyhow::Result;
use js_sys::Error;
use log::info;
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
    let shader = create_triangle_stuff(&ctx).map_err(|e| Error::new(&format!("{}", e)))?;

    Ok(TriangleDemo { canvas, ctx })
  }

  pub fn update(&mut self) {
    self.canvas.check_size();
  }
}

fn create_triangle_stuff(ctx: &Context) -> Result<Shader> {
  let vert_src = include_str!("./shaders/triangle_vert.glsl");
  let frag_src = include_str!("./shaders/triangle_frag.glsl");

  let shader = ctx.create_shader(&vert_src, &frag_src, &[])?;

  let block_index = shader.get_uniform_block_index("UBOData");

  info!("block_index {:?}", block_index);

  let block_size = shader.get_uniform_block_size(block_index)?;

  info!("block_size {:?}", block_size);

  let uniform_indices = shader.get_uniform_indices(&["UBORed", "UBOGreen", "UBOBlue"]);

  info!("uniform_indices {:?}", uniform_indices);

  let uniform_offsets = shader.get_uniform_offsets(&uniform_indices);

  info!("uniform_offsets {:?}", uniform_offsets);

  Ok(shader)
}
