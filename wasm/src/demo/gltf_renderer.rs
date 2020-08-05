use generational_arena::Index;
use gltf::Gltf;
use log::info;
use na::{Point2, Point3, UnitQuaternion, Vector3};
use ncollide3d::procedural::{bezier_surface, TriMesh};
use noise::{NoiseFn, Perlin, Seedable};
use std::f32::consts::PI;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;

use crate::renderer::webgl::context::Context;
use crate::renderer::webgl::renderer::{Camera, Material, PBRMaterialParams, Renderer};
use crate::renderer::webgl::turntable::Turntable;
use crate::scene::node::{compose_matrix, Node};

use super::webgl_canvas::WebGlCanvas;

#[wasm_bindgen]
pub struct GLTFRendererDemo {
  renderer: Renderer,
  camera_handle: Index,
  canvas: WebGlCanvas,
  turntable: Turntable,
}

#[wasm_bindgen]
impl GLTFRendererDemo {
  #[wasm_bindgen(constructor)]
  pub fn new(gltf_data: &[u8]) -> StdResult<GLTFRendererDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let gltf = Gltf::from_slice(gltf_data).unwrap();
    let turntable = Turntable::new(10.0, 0.01);

    let mut renderer = Renderer::new(ctx);

    let camera_handle = renderer.cameras.insert(Camera::default());

    let whale_handles = renderer.bake_gltf(&gltf);

    renderer
      .scene
      .set_parent(whale_handles[0], renderer.scene.get_root_handle());

    let whale_node = renderer
      .scene
      .get_node_mut(whale_handles[0])
      .expect("whale_node_exists");

    whale_node.matrix_local = compose_matrix(
      None,
      Some(UnitQuaternion::from_euler_angles(PI / 2.0, 0.0, 0.0)),
      Some(Vector3::new(1.4, 1.4, 1.4)),
    );

    // info!("whale_handles {:#?}", whale_handles);
    // info!("renderer {:#?}", renderer);

    let blue_material_handle = renderer.insert_material(Material::PBR(PBRMaterialParams {
      color: Vector3::new(0.0, 0.0, 1.0),
    }));

    //

    let cuboid_mesh_handle = renderer.bake_cuboid_mesh(
      Vector3::new(1.0, 1.0, 1.0),
      Some(blue_material_handle),
      None,
    );

    let mut cuboid_node = Node::new(Some(renderer.scene.get_root_handle()));

    cuboid_node.matrix_local = compose_matrix(Some(Vector3::new(-5.0, 0.0, 0.0)), None, None);
    cuboid_node.mesh = Some(cuboid_mesh_handle);
    cuboid_node.name = Some(String::from("cuboid"));

    renderer.insert_node(cuboid_node);

    //

    let ground_mesh = get_ground_surface_tri_mesh(&Vector3::new(4.0, 2.0, 4.0), 0);

    let ground_mesh_handle = renderer.bake_tri_mesh(
      ground_mesh,
      Some(blue_material_handle),
      Some(String::from("ground")),
    );

    let mut ground_node = Node::new(Some(renderer.scene.get_root_handle()));

    // ground_node.matrix_local = compose_matrix(Some(Vector3::new(-5.0, 0.0, 0.0)), None, None);
    ground_node.mesh = Some(ground_mesh_handle);
    ground_node.name = Some(String::from("ground"));

    renderer.insert_node(ground_node);

    Ok(GLTFRendererDemo {
      camera_handle,
      canvas,
      renderer,
      turntable,
    })
  }

  pub fn start_interaction(&mut self, x: f32, y: f32) {
    self.turntable.start(Point2::new(x, y));
  }

  pub fn interact(&mut self, x: f32, y: f32) {
    self.turntable.rotate(Point2::new(x, y));
  }

  pub fn update(&mut self) {
    if self.canvas.check_size() {
      self
        .renderer
        .ctx
        .viewport(0, 0, self.canvas.width as i32, self.canvas.height as i32);
    }

    self.renderer.ctx.clear_color(1.0, 1.0, 1.0, 1.0);
    self.renderer.ctx.clear(true, true);

    self.renderer.scene.update_matrix_world();

    let aspect = self.canvas.width as f32 / self.canvas.height as f32;
    let fovy = 75.0 / 180.0 * PI;
    let near = 0.01;
    let far = 30.0;

    self
      .renderer
      .make_perspective_camera(self.camera_handle, aspect, fovy, near, far);

    self
      .turntable
      .update_camera(&mut self.renderer, self.camera_handle);

    self
      .renderer
      .render_scene(self.renderer.scene.get_root_handle(), self.camera_handle);
  }
}

fn get_perlin_data(width: usize, height: usize, a: f64, b: f64, seed: u32) -> Vec<f32> {
  let perlin = Perlin::new();
  perlin.set_seed(seed);

  let mut data = vec![0.0; width * height * 4];

  let x_factor = 1.0 / (width - 1) as f64;
  let y_factor = 1.0 / (height - 1) as f64;

  for row in 0..height {
    for col in 0..width {
      let x = x_factor * col as f64;
      let y = y_factor * row as f64;
      let mut sum = 0.0;
      let mut freq = a;
      let mut scale = b;

      for oct in 0..4 {
        let val = perlin.get([x * freq, y * freq]) / scale;
        sum += val;
        let result = (sum + 1.0) / 2.0;

        data[((row * width + col) * 4) + oct] = result as f32;
        freq *= 2.0;
        scale *= b;
      }
    }
  }

  data
}

pub fn get_ground_surface_tri_mesh(size: &Vector3<f32>, seed: u32) -> TriMesh<f32> {
  let width = 32;
  let height = 32;

  let data = get_perlin_data(width, height, 2.0, 2.0, seed);
  let mut points = vec![];

  let wf = width as f32;
  let hf = height as f32;

  for row in 0..height {
    for col in 0..width {
      let x = -wf / 2.0 + (row as f32 / wf) * size.x;
      let z = -hf / 2.0 + (col as f32 / hf) * size.z;
      let y = data[((row * width + col) * 4)] * size.y;

      points.push(Point3::new(x, y, z));
    }
  }

  bezier_surface(&points, 32, 32, 16, 16)
}
