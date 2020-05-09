use anyhow::Result;
use js_sys::Error;
use log::info;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use super::webgl_canvas::WebGlCanvas;
use crate::math::{Matrix4, Vector3};
use crate::renderer::webgl::context::{
  BufferTarget, BufferUsage, Cleaning, ComponentType, Context, DrawMode,
};
use crate::renderer::webgl::shader::{AttributeOptions, Shader};

#[wasm_bindgen]
pub struct SkinningDemo {
  canvas: WebGlCanvas,
  ctx: Context,
  shader: Shader,
  angle: f32,
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
      angle: 0.0,
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

    self.angle += 0.01;

    let mt = Matrix4::translation(0.5, 0.0, 0.0);
    let mr = Matrix4::rotation_axis(Vector3::forward(), self.angle);
    let model_matrix = mt * mr;

    self.shader.set_matrix4("modelMatrix", &model_matrix);

    self.ctx.draw_arrays(DrawMode::Triangles, 0, 3);
  }
}

fn create_triangle_stuff(ctx: &Context) -> Result<Shader> {
  let vert_src = include_str!("./shaders/skinning_vert.glsl");
  let frag_src = include_str!("./shaders/skinning_frag.glsl");

  let shader = ctx.create_shader(&vert_src, &frag_src, &[])?;

  let vertices = vec![0.0, 0.0, 0.2, 0.0, 0.2, 0.2];

  let vertex_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &vertices,
  );

  shader.bind();

  ctx.bind_buffer(BufferTarget::ArrayBuffer, vertex_buffer.as_ref());
  ctx.switch_attributes(1);

  let attr = AttributeOptions::new(ComponentType::Float, 2);

  shader.bind_attribute("position", &attr);

  info!("attr {:#?}", attr);

  Ok(shader)
}
