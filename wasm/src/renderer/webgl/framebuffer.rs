use super::context::{FramebufferAttachment, TexParam, TextureFormat, TextureKind, TypedArrayKind};
use super::renderer::{RenderTarget, Renderer, Sampler, Texture};
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
    let color_image_handle = self.insert_image(color_image);
    let color_sampler_handle = self.insert_sampler(sampler);
    let color_texture = Texture {
      source: color_image_handle,
      sampler: color_sampler_handle,
    };
    let color_texture_handle = self.insert_texture(color_texture);

    // depth texture
    let depth_texture_handle = if let Some(depth_image) = depth_image_option {
      let depth_image_handle = self.insert_image(depth_image);
      let depth_sampler_handle = self.insert_sampler(Sampler {
        wrap_s: TexParam::ClampToEdge,
        wrap_t: TexParam::ClampToEdge,
        min_filter: TexParam::Nearest,
        mag_filter: TexParam::Nearest,
      });
      let depth_texture = Texture {
        source: depth_image_handle,
        sampler: depth_sampler_handle,
      };
      Some(self.insert_texture(depth_texture))
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
