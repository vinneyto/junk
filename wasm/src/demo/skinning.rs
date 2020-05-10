use anyhow::Result;
use js_sys::Error;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use super::webgl_canvas::WebGlCanvas;
use crate::math::{Matrix4, Vector3};
use crate::renderer::webgl::context::{
  BufferTarget, BufferUsage, Cleaning, Context, DrawMode, TypedArrayKind,
};
use crate::renderer::webgl::define::Define;
use crate::renderer::webgl::shader::{AttributeOptions, Shader};

#[wasm_bindgen]
pub struct SkinningDemo {
  canvas: WebGlCanvas,
  ctx: Context,
  shader: Shader,
  angle: f32,
  inverse_bone: Vec<Matrix4>,
}

#[wasm_bindgen]
impl SkinningDemo {
  #[wasm_bindgen(constructor)]
  pub fn new() -> StdResult<SkinningDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let shader = create_skinning_stuff(&ctx).map_err(|e| Error::new(&format!("{}", e)))?;
    let inverse_bone = compute_bone_matrices(0.0)
      .iter()
      .map(|m| m.inverse())
      .collect();

    Ok(SkinningDemo {
      canvas,
      ctx,
      shader,
      angle: 0.0,
      inverse_bone,
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

    let aspect = (self.canvas.width as f32) / (self.canvas.height as f32);
    let half_size = 10.0;

    let projection = Matrix4::orthographic(
      half_size * aspect * -1.0,
      half_size * aspect,
      half_size,
      half_size * -1.0,
      half_size * -1.0,
      half_size,
    );

    self.angle += 0.01;

    let bone_matrices: Vec<Matrix4> = compute_bone_matrices(self.angle.sin())
      .iter()
      .enumerate()
      .map(|v| *v.1 * self.inverse_bone[v.0])
      .collect();

    let mut data: Vec<f32> = vec![];

    for bone in bone_matrices {
      data.extend(&bone.data);
    }

    self.shader.set_matrix4("projection", &projection);
    self.shader.set_matrix4_data("bones[0]", &data);

    self
      .ctx
      .draw_elements(DrawMode::Lines, 26, TypedArrayKind::Uint16, 0);
  }
}

fn compute_bone_matrices(angle: f32) -> Vec<Matrix4> {
  let mt = Matrix4::translation(4.0, 0.0, 0.0);
  let mr = Matrix4::rotation_axis(Vector3::forward(), angle);
  let m1 = Matrix4::identity();
  let m2 = m1 * mr * mt;
  let m3 = m2 * mr * mt;
  let m4 = Matrix4::identity();

  vec![m1, m2, m3, m4]
}

fn create_skinning_stuff(ctx: &Context) -> Result<Shader> {
  let vert_src = include_str!("./shaders/skinning_vert.glsl");
  let frag_src = include_str!("./shaders/skinning_frag.glsl");

  let shader = ctx.create_shader(&vert_src, &frag_src, &[Define::int("MAX_BONES", 4)])?;

  let position_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &vec![
      0.0, 1.0, // 0
      0.0, -1.0, // 1
      2.0, 1.0, // 2
      2.0, -1.0, // 3
      4.0, 1.0, // 4
      4.0, -1.0, // 5
      6.0, 1.0, // 6
      6.0, -1.0, // 7
      8.0, 1.0, // 8
      8.0, -1.0, // 9
    ],
  );

  let bone_ndx_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &vec![
      0.0, 0.0, 0.0, 0.0, // 0
      0.0, 0.0, 0.0, 0.0, // 1
      0.0, 1.0, 0.0, 0.0, // 2
      0.0, 1.0, 0.0, 0.0, // 3
      1.0, 0.0, 0.0, 0.0, // 4
      1.0, 0.0, 0.0, 0.0, // 5
      1.0, 2.0, 0.0, 0.0, // 6
      1.0, 2.0, 0.0, 0.0, // 7
      2.0, 0.0, 0.0, 0.0, // 8
      2.0, 0.0, 0.0, 0.0, // 9
    ],
  );

  let weight_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &vec![
      1.0, 0.0, 0.0, 0.0, // 0
      1.0, 0.0, 0.0, 0.0, // 1
      0.5, 0.5, 0.0, 0.0, // 2
      0.5, 0.5, 0.0, 0.0, // 3
      1.0, 0.0, 0.0, 0.0, // 4
      1.0, 0.0, 0.0, 0.0, // 5
      0.5, 0.5, 0.0, 0.0, // 6
      0.5, 0.5, 0.0, 0.0, // 7
      1.0, 0.0, 0.0, 0.0, // 8
      1.0, 0.0, 0.0, 0.0, // 9
    ],
  );

  let indices_buffer = ctx.create_buffer(
    BufferTarget::ElementArrayBuffer,
    BufferUsage::StaticDraw,
    &vec![
      0, 1, 0, 2, 1, 3, 2, 3, //
      2, 4, 3, 5, 4, 5, 4, 6, 5, 7, //
      6, 7, 6, 8, 7, 9, 8, 9,
    ],
  );

  shader.bind();

  ctx.switch_attributes(3);

  ctx.bind_buffer(BufferTarget::ArrayBuffer, position_buffer.as_ref());
  shader.bind_attribute(
    "position",
    &AttributeOptions::new(TypedArrayKind::Float32, 2),
  );

  ctx.bind_buffer(BufferTarget::ArrayBuffer, bone_ndx_buffer.as_ref());
  shader.bind_attribute(
    "boneNdx",
    &AttributeOptions::new(TypedArrayKind::Float32, 4),
  );

  ctx.bind_buffer(BufferTarget::ArrayBuffer, weight_buffer.as_ref());
  shader.bind_attribute("weight", &AttributeOptions::new(TypedArrayKind::Float32, 4));

  ctx.bind_buffer(BufferTarget::ElementArrayBuffer, indices_buffer.as_ref());

  Ok(shader)
}
