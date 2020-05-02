use console_log;
use js_sys::Error;
use log::Level;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{window, HtmlCanvasElement, WebGl2RenderingContext};

pub struct Canvas {
  pub canvas: HtmlCanvasElement,
  pub gl: WebGl2RenderingContext,
  pub width: u32,
  pub height: u32,
}

impl Canvas {
  pub fn new() -> StdResult<Canvas, JsValue> {
    console_error_panic_hook::set_once();

    console_log::init_with_level(Level::Info)
      .map_err(|_| Error::new("logger initialization error"))?;

    let canvas = create_canvas()?;
    let gl = get_webgl_context(&canvas)?;
    let width = 0;
    let height = 0;

    fit_canvas(&canvas)?;

    Ok(Canvas {
      canvas,
      gl,
      width,
      height,
    })
  }

  pub fn check_size(&mut self) -> bool {
    let (width, height) = get_canvas_size(&self.canvas).unwrap_or((0, 0));

    if self.width != width || self.height != height {
      self.width = width;
      self.height = height;

      self.canvas.set_width(width);
      self.canvas.set_height(height);

      return true;
    }

    false
  }
}

pub fn create_canvas() -> Result<HtmlCanvasElement, Error> {
  let w = window().ok_or_else(|| Error::new("should have a window"))?;

  let document = w
    .document()
    .ok_or_else(|| Error::new("Should have document"))?;

  let canvas = document
    .create_element("canvas")?
    .dyn_into::<HtmlCanvasElement>()
    .map_err(|e| Error::new(&format!("can't cast to context, {:?}", e)))?;

  Ok(canvas)
}

pub fn get_webgl_context(canvas: &HtmlCanvasElement) -> Result<WebGl2RenderingContext, Error> {
  canvas
    .get_context("webgl2")
    .map_err(|e| Error::new(&format!("error during context creation, {:?}", e)))?
    .ok_or_else(|| Error::new("null was returned"))?
    .dyn_into::<WebGl2RenderingContext>()
    .map_err(|e| Error::new(&format!("can't cast to context, {:?}", e)))
}

pub fn get_canvas_size(canvas: &HtmlCanvasElement) -> Result<(u32, u32), Error> {
  let w = window().ok_or_else(|| Error::new("Should have a window"))?;
  let width = canvas.client_width() as f32;
  let height = canvas.client_height() as f32;
  let pixel_ratio = w.device_pixel_ratio() as f32;

  Ok(((width * pixel_ratio) as u32, (height * pixel_ratio) as u32))
}

pub fn fit_canvas(canvas: &HtmlCanvasElement) -> Result<(), Error> {
  web_sys::window()
    .unwrap()
    .document()
    .unwrap()
    .body()
    .unwrap()
    .append_child(canvas)?;

  canvas.style().set_property("position", "fixed")?;
  canvas.style().set_property("width", "100%")?;
  canvas.style().set_property("height", "100%")?;
  canvas.style().set_property("left", "0")?;
  canvas.style().set_property("top", "0")?;

  Ok(())
}
