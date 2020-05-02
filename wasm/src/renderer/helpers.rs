use js_sys::Error;
use wasm_bindgen::JsCast;
use web_sys::{window, HtmlCanvasElement, WebGl2RenderingContext};

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
