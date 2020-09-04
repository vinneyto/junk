use super::renderer::Renderer;
use generational_arena::Index;
use na::Vector4;

pub struct Pass {
  background_color: Vector4<f32>,
  clean_color: bool,
  clean_depth: bool,
  render_target_handle: Option<Index>,
  handler: Box<dyn Fn(&mut Renderer)>,
}

impl Pass {
  pub fn new() -> Self {
    Pass {
      background_color: Vector4::new(1.0, 1.0, 1.0, 1.0),
      clean_color: true,
      clean_depth: true,
      render_target_handle: None,
      handler: Box::new(|_| ()),
    }
  }

  pub fn set_background_color(mut self, background_color: Vector4<f32>) -> Self {
    self.background_color = background_color;
    self
  }

  pub fn set_clean_color(mut self, clean_color: bool) -> Self {
    self.clean_color = clean_color;
    self
  }

  pub fn set_clean_depth(mut self, clean_depth: bool) -> Self {
    self.clean_depth = clean_depth;
    self
  }

  pub fn set_handler<T: Fn(&mut Renderer) + 'static>(mut self, handler: T) -> Self {
    self.handler = Box::new(handler);
    self
  }

  pub fn set_render_target_handle(mut self, render_target_handle: Option<Index>) -> Self {
    self.render_target_handle = render_target_handle;
    self
  }

  pub fn render(&self, renderer: &mut Renderer) {
    let Self {
      handler,
      background_color,
      clean_color,
      clean_depth,
      ..
    } = &self;

    if let Some(render_target_handle) = self.render_target_handle {
      let target = renderer.targets.get(render_target_handle).unwrap();
      let fb = renderer.framebuffers.get(target.fb).unwrap();

      renderer.ctx.bind_framebuffer(Some(&fb));
    }

    renderer.ctx.clear_color(
      background_color.x,
      background_color.y,
      background_color.z,
      background_color.w,
    );
    renderer.ctx.clear(*clean_color, *clean_depth);

    handler(renderer);

    if self.render_target_handle.is_some() {
      renderer.ctx.bind_framebuffer(None);
    }
  }
}
