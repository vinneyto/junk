use super::context::{FramebufferAttachment, TexParam, TextureFormat, TextureKind, TypedArrayKind};
use super::renderer::{RenderTarget, Renderer, Sampler};
use generational_arena::Index;

impl Renderer {
  pub fn bake_render_target(
    &mut self,
    width: u32,
    height: u32,
    sampler: Sampler,
    depth: bool,
  ) -> Index {
    let fb = self.ctx.create_framebuffer().unwrap();
    let color_image = self.ctx.create_texture().unwrap();

    self.ctx.bind_framebuffer(Some(&fb));

    self
      .ctx
      .bind_texture(TextureKind::Texture2d, Some(&color_image));

    self
      .ctx
      .empty_texture_data(
        TextureKind::Texture2d,
        0,
        TextureFormat::RGBA,
        width as i32,
        height as i32,
        0,
        TextureFormat::RGBA,
        TypedArrayKind::Uint8,
      )
      .unwrap();

    self
      .ctx
      .framebuffer_texture_2d(FramebufferAttachment::ColorAttachment0, Some(&color_image));

    let depth_image_option = match depth {
      true => {
        let depth_image = self.ctx.create_texture().unwrap();

        self
          .ctx
          .bind_texture(TextureKind::Texture2d, Some(&depth_image));

        self
          .ctx
          .empty_texture_data(
            TextureKind::Texture2d,
            0,
            TextureFormat::Depth,
            width as i32,
            height as i32,
            0,
            TextureFormat::Depth,
            TypedArrayKind::Uint16,
          )
          .unwrap();

        self
          .ctx
          .framebuffer_texture_2d(FramebufferAttachment::DepthAttachment, Some(&depth_image));

        Some(depth_image)
      }
      false => None,
    };

    let complete = self.ctx.check_framebuffer_complete();

    self.ctx.bind_framebuffer(None);

    if !complete {
      panic!("framebuffer is incomplete");
    }

    // fb
    let fb_handle = self.insert_framebuffer(fb);

    // color texture
    let color_texture_handle = self.compose_texture(color_image, sampler);

    // depth texture
    let depth_texture_handle = if let Some(depth_image) = depth_image_option {
      Some(self.compose_texture(
        depth_image,
        Sampler {
          wrap_s: TexParam::ClampToEdge,
          wrap_t: TexParam::ClampToEdge,
          min_filter: TexParam::Nearest,
          mag_filter: TexParam::Nearest,
        },
      ))
    } else {
      None
    };

    self.insert_render_target(RenderTarget {
      fb: fb_handle,
      color_texture: color_texture_handle,
      depth_texture: depth_texture_handle,
    })
  }
}
