use super::webgl2_canvas::WebGl2Canvas;
use crate::renderer::webgl2::context::{
  AttributeOptions, BufferBaseTarget, BufferTarget, BufferUsage, Cleaning, ComponentType, Context,
  DrawMode,
};
use crate::renderer::webgl2::shader::Shader;
use anyhow::Result;
use js_sys::Error;
use log::info;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct TriangleDemo {
  canvas: WebGl2Canvas,
  ctx: Context,
  shader: Shader,
}

#[wasm_bindgen]
impl TriangleDemo {
  #[wasm_bindgen(constructor)]
  pub fn new() -> StdResult<TriangleDemo, JsValue> {
    let canvas = WebGl2Canvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let shader = create_triangle_stuff(&ctx).map_err(|e| Error::new(&format!("{}", e)))?;

    Ok(TriangleDemo {
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
  let vert_src = include_str!("./shaders/triangle_vert.glsl");
  let frag_src = include_str!("./shaders/triangle_frag.glsl");

  let shader = ctx.create_shader(&vert_src, &frag_src, &[])?;

  // prepare

  // ubo

  let block_index = shader.get_uniform_block_index("UBOData");

  info!("block_index {:?}", block_index);

  let block_size = shader.get_uniform_block_size(block_index)?;

  info!("block_size {:?}", block_size);

  let uniform_indices = shader.get_uniform_indices(&["UBORed", "UBOGreen", "UBOBlue"]);

  info!("uniform_indices {:?}", uniform_indices);

  let uniform_offsets = shader.get_active_uniforms_offset(&uniform_indices);

  info!("uniform_offsets {:?}", uniform_offsets);

  let num_cells = block_size / (std::mem::size_of::<f32>() as u32);

  let mut buffer_data: Vec<f32> = vec![0.0; num_cells as usize];

  buffer_data[0] = 1.0;
  buffer_data[1] = 0.2;
  buffer_data[2] = 0.4;

  info!("buffer_data {:?}", buffer_data);

  let uniform_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &buffer_data,
  );

  // vbo

  let vertices = vec![0.0, 0.0, 1.0, 0.0, 1.0, 1.0];

  let vertex_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &vertices,
  );

  let vao = ctx.create_vertex_array();

  ctx.bind_vertex_array(vao.as_ref());

  let mut attr = AttributeOptions::default();

  attr.location = shader.get_attrib_location("position");
  attr.component_type = ComponentType::Float;
  attr.item_size = 2;

  info!("attr {:#?}", attr);

  ctx.bind_attribute(vertex_buffer.as_ref(), &attr);

  ctx.bind_vertex_array(None);

  // render

  let binding_point = 0;

  ctx.bind_buffer_base(
    BufferBaseTarget::UniformBuffer,
    binding_point,
    uniform_buffer.as_ref(),
  );

  shader.uniform_block_binding(block_index, binding_point);

  ctx.bind_vertex_array(vao.as_ref());

  Ok(shader)
}
