use super::webgl_canvas::WebGlCanvas;
use crate::renderer::webgl::context::{
  BufferTarget, BufferUsage, Cleaning, ComponentType, Context, DrawMode,
};
use crate::renderer::webgl::shader::{AttributeOptions, Shader};
use anyhow::Result;
use js_sys::Error;
use log::info;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SkinningDemo {
  canvas: WebGlCanvas,
  ctx: Context,
  shader: Shader,
}

#[wasm_bindgen]
impl SkinningDemo {
  #[wasm_bindgen(constructor)]
  pub fn new() -> StdResult<SkinningDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let shader = create_triangle_stuff(&ctx).map_err(|e| Error::new(&format!("{}", e)))?;

    Ok(SkinningDemo {
      canvas,
      ctx,
      shader,
    })
  }

  pub fn update(&mut self) {
    if self.canvas.check_size() {
      self
        .ctx
        .viewport(0, 0, self.canvas.width as i32, self.canvas.height as i32);
    }

    self.ctx.clear_color(1.0, 1.0, 1.0, 1.0);
    self.ctx.clear(Cleaning::Color);
    self.ctx.clear(Cleaning::Depth);

    self.shader.bind();

    self.ctx.draw_arrays(DrawMode::Triangles, 0, 3);
  }
}

fn create_triangle_stuff(ctx: &Context) -> Result<Shader> {
  let vert_src = include_str!("./shaders/skinning_vert.glsl");
  let frag_src = include_str!("./shaders/skinning_frag.glsl");

  let shader = ctx.create_shader(&vert_src, &frag_src, &[])?;

  let vertices = vec![0.0, 0.0, 1.0, 0.0, 1.0, 1.0];

  let vertex_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &vertices,
  );

  shader.bind();

  ctx.bind_buffer(BufferTarget::ArrayBuffer, vertex_buffer.as_ref());
  ctx.switch_attributes(1);

  let mut attr = AttributeOptions::default();

  attr.component_type = ComponentType::Float;
  attr.item_size = 2;

  shader.bind_attribute("position", &attr);

  info!("attr {:#?}", attr);

  Ok(shader)
}
