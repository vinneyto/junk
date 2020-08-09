use generational_arena::Index;
use web_sys::HtmlImageElement;

use super::context::{TextureFormat, TextureKind, TypedArrayKind};
use super::renderer::{Renderer, Sampler, Texture};

impl Renderer {
  pub fn bake_2d_texture(
    &mut self,
    format: TextureFormat,
    sampler: Sampler,
    image: &HtmlImageElement,
  ) -> Index {
    let texture_image = self.ctx.create_texture().unwrap();

    self
      .ctx
      .bind_texture(TextureKind::Texture2d, Some(&texture_image));

    self
      .ctx
      .texture_image_data(
        TextureKind::Texture2d,
        0,
        format,
        format,
        TypedArrayKind::Uint8,
        image,
      )
      .unwrap();

    self.ctx.generate_mipmap(TextureKind::Texture2d);

    self.ctx.bind_texture(TextureKind::Texture2d, None);

    let image_handle = self.insert_image(texture_image);
    let sampler_handle = self.insert_sampler(sampler);

    let texture = Texture {
      source: image_handle,
      sampler: sampler_handle,
    };

    self.insert_texture(texture)
  }

  pub fn bake_2d_rgb_texture(&mut self, sampler: Sampler, image: &HtmlImageElement) -> Index {
    self.bake_2d_texture(TextureFormat::RGB, sampler, image)
  }
}
