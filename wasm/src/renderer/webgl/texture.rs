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
    let webgl_texture = self.ctx.create_texture().unwrap();

    self
      .ctx
      .bind_texture(TextureKind::Texture2d, Some(&webgl_texture));

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

    let image_handle = self.insert_image(webgl_texture);
    let sampler_handle = self.insert_sampler(sampler);

    let texture = Texture {
      source: image_handle,
      sampler: sampler_handle,
    };

    self.insert_texture(texture)
  }

  pub fn bake_cube_map_texture(
    &mut self,
    format: TextureFormat,
    sampler: Sampler,
    src: &[(TextureKind, &HtmlImageElement)],
  ) -> Index {
    let webgl_texture = self.ctx.create_texture().unwrap();

    self
      .ctx
      .bind_texture(TextureKind::CubeMap, Some(&webgl_texture));

    for image in src {
      self
        .ctx
        .texture_image_data(image.0, 0, format, format, TypedArrayKind::Uint8, image.1)
        .unwrap();
    }

    self.ctx.generate_mipmap(TextureKind::CubeMap);

    self.ctx.bind_texture(TextureKind::CubeMap, None);

    let image_handle = self.insert_image(webgl_texture);
    let sampler_handle = self.insert_sampler(sampler);

    let texture = Texture {
      source: image_handle,
      sampler: sampler_handle,
    };

    self.insert_texture(texture)
  }
}
