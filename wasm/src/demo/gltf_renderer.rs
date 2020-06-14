use generational_arena::Index;
use gltf::Gltf;
use log::info;
use na::{Isometry3, Perspective3, Translation3, UnitQuaternion};
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use crate::renderer::webgl::camera::CameraState;
use crate::renderer::webgl::context::Context;
use crate::renderer::webgl::gltf_util::create_gltf_scenes;
use crate::renderer::webgl::mesh::Meshes;
use crate::renderer::webgl::renderer::Renderer;
use crate::scene::scene::Scene;

use super::webgl_canvas::WebGlCanvas;

#[wasm_bindgen]
pub struct GLTFRendererDemo {
  renderer: Renderer,
  scene: Scene,
  meshes: Meshes,
  root_handle: Index,
  canvas: WebGlCanvas,
}

#[wasm_bindgen]
impl GLTFRendererDemo {
  #[wasm_bindgen(constructor)]
  pub fn new(gltf_data: &[u8]) -> StdResult<GLTFRendererDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let mut renderer = Renderer::new(ctx);
    let gltf = Gltf::from_slice(gltf_data).unwrap();

    let mut scene = Scene::new();
    let mut meshes = Meshes::new();

    let scenes = create_gltf_scenes(&gltf, &mut renderer, &mut scene, &mut meshes);

    // info!("scenes {:#?}", scenes);
    // info!("scene {:#?}", scene);
    // info!("meshes {:#?}", meshes);

    Ok(GLTFRendererDemo {
      root_handle: scenes[0],
      renderer,
      canvas,
      scene,
      meshes,
    })
  }

  pub fn update(&mut self) {
    if self.canvas.check_size() {
      self
        .renderer
        .set_size(self.canvas.width as i32, self.canvas.height as i32);
    }

    self.renderer.set_clear_color(1.0, 1.0, 1.0, 1.0);
    self.renderer.clear(true, true);

    let view = Isometry3::from_parts(
      Translation3::new(0.0, 0.0, 10.0),
      UnitQuaternion::identity(),
    )
    .inverse();

    let aspect = (self.canvas.width as f32) / (self.canvas.height as f32);
    let projection = Perspective3::new(aspect, 1.0, 0.1, 50.0);

    let camera_state = CameraState {
      view: view.to_homogeneous(),
      projection: projection.to_homogeneous(),
    };

    self
      .renderer
      .render(
        self.root_handle,
        &mut self.scene,
        &mut self.meshes,
        &camera_state,
      )
      .unwrap();
  }
}
