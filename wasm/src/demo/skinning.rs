use anyhow::Result;
use js_sys::Error;
use na::{Isometry3, Matrix4, Orthographic3, Vector3};
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;
use web_sys::WebGlTexture;

use super::webgl_canvas::WebGlCanvas;
use crate::renderer::webgl::context::{
  BufferTarget, BufferUsage, Cleaning, Context, DrawMode, TexParam, TexParamName, TextureFormat,
  TextureKind, TypedArrayKind,
};
use crate::renderer::webgl::define::Define;
use crate::renderer::webgl::shader::{AttributeOptions, Shader};

#[wasm_bindgen]
pub struct SkinningDemo {
  canvas: WebGlCanvas,
  ctx: Context,
  shader: Shader,
  bone_matrix_texture: Option<WebGlTexture>,
  angle: f32,
  inverse_bone: Vec<Matrix4<f32>>,
}

#[wasm_bindgen]
impl SkinningDemo {
  #[wasm_bindgen(constructor)]
  pub fn new() -> StdResult<SkinningDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let (shader, bone_matrix_texture) =
      create_skinning_stuff(&ctx).map_err(|e| Error::new(&format!("{}", e)))?;
    let inverse_bone = compute_bone_matrices(0.0)
      .iter()
      .map(|m| m.try_inverse().unwrap_or_else(|| Matrix4::identity()))
      .collect();

    Ok(SkinningDemo {
      canvas,
      ctx,
      shader,
      bone_matrix_texture,
      angle: 0.0,
      inverse_bone,
    })
  }

  pub fn update(&mut self) -> StdResult<(), JsValue> {
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

    let projection = Orthographic3::new(
      half_size * aspect * -1.0,
      half_size * aspect,
      half_size,
      half_size * -1.0,
      half_size * -1.0,
      half_size,
    )
    .to_homogeneous();

    self.angle += 0.01;

    let bone_matrices: Vec<Matrix4<f32>> = compute_bone_matrices(self.angle.sin())
      .iter()
      .enumerate()
      .map(|v| *v.1 * self.inverse_bone[v.0])
      .collect();

    self
      .ctx
      .bind_texture(TextureKind::Texture2d, self.bone_matrix_texture.as_ref());

    let bone_data = bone_matrices_to_vec(&bone_matrices);

    self
      .ctx
      .texture_data(
        TextureKind::Texture2d,
        0,
        TextureFormat::RGBA,
        4,
        4,
        0,
        TextureFormat::RGBA,
        &bone_data,
      )
      .map_err(|e| Error::new(&format!("{}", e)))?;

    self.shader.set_matrix4("projection", &projection);
    self.shader.set_integer("boneMatrixTexture", 0);
    self.shader.set_float("numBones", 4.0);

    self
      .ctx
      .draw_elements(DrawMode::Lines, 26, TypedArrayKind::Uint16, 0);

    Ok(())
  }
}

fn compute_bone_matrices(angle: f32) -> Vec<Matrix4<f32>> {
  let shift = Isometry3::new(Vector3::new(4.0, 0.0, 0.0), Vector3::new(0.0, 0.0, 0.0));
  let rotate = Isometry3::new(Vector3::new(0.0, 0.0, 0.0), Vector3::z() * angle);
  let i1 = Isometry3::identity();
  let i2 = i1 * rotate * shift;
  let i3 = i2 * rotate * shift;
  let i4 = Isometry3::identity();

  vec![
    i1.to_homogeneous(),
    i2.to_homogeneous(),
    i3.to_homogeneous(),
    i4.to_homogeneous(),
  ]
}

fn bone_matrices_to_vec(matrices: &[Matrix4<f32>]) -> Vec<f32> {
  let mut data: Vec<f32> = vec![];
  for bone in matrices {
    data.extend(bone.iter());
  }
  data
}

fn create_skinning_stuff(ctx: &Context) -> Result<(Shader, Option<WebGlTexture>)> {
  ctx.get_extension("OES_texture_float")?;

  let vert_src = include_str!("./shaders/skinning_vert.glsl");
  let frag_src = include_str!("./shaders/skinning_frag.glsl");

  let shader = ctx.create_shader(&vert_src, &frag_src, &[Define::int("MAX_BONES", 4)])?;

  let position: Vec<f32> = vec![
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
  ];

  let position_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &position,
  );

  let bone_ndx: Vec<f32> = vec![
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
  ];

  let bone_ndx_buffer = ctx.create_buffer(
    BufferTarget::ArrayBuffer,
    BufferUsage::StaticDraw,
    &bone_ndx,
  );

  let weight: Vec<f32> = vec![
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
  ];

  let weight_buffer =
    ctx.create_buffer(BufferTarget::ArrayBuffer, BufferUsage::StaticDraw, &weight);

  let indices: Vec<u16> = vec![
    0, 1, 0, 2, 1, 3, 2, 3, //
    2, 4, 3, 5, 4, 5, 4, 6, 5, 7, //
    6, 7, 6, 8, 7, 9, 8, 9,
  ];

  let indices_buffer = ctx.create_buffer(
    BufferTarget::ElementArrayBuffer,
    BufferUsage::StaticDraw,
    &indices,
  );

  let bone_matrix_texture = ctx.create_texture();

  ctx.bind_texture(TextureKind::Texture2d, bone_matrix_texture.as_ref());

  ctx.texture_parameter(
    TextureKind::Texture2d,
    TexParamName::TextureMinFilter,
    TexParam::Nearest,
  );
  ctx.texture_parameter(
    TextureKind::Texture2d,
    TexParamName::TextureMagFilter,
    TexParam::Nearest,
  );
  ctx.texture_parameter(
    TextureKind::Texture2d,
    TexParamName::TextureWrapS,
    TexParam::ClampToEdge,
  );
  ctx.texture_parameter(
    TextureKind::Texture2d,
    TexParamName::TextureWrapT,
    TexParam::ClampToEdge,
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

  Ok((shader, bone_matrix_texture))
}
