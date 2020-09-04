use generational_arena::Index;
use gltf::Gltf;
use log::info;
use na::{Point2, Point3, UnitQuaternion, Vector2, Vector3, Vector4};
use ncollide3d::procedural::{unit_quad, TriMesh};
use noise::{NoiseFn, Perlin, Seedable};
use std::f32::consts::PI;
use std::result::Result as StdResult;
use wasm_bindgen::prelude::*;
use web_sys::HtmlImageElement;

use crate::renderer::webgl::context::{Context, TexParam, TextureFormat, TextureKind};
use crate::renderer::webgl::material::{PbrMaterial, SkyboxMaterial};
use crate::renderer::webgl::pass::Pass;
use crate::renderer::webgl::renderer::{Camera, Renderer, Sampler};
use crate::renderer::webgl::turntable::Turntable;
use crate::scene::node::{compose_matrix, Node};

use super::webgl_canvas::WebGlCanvas;

#[wasm_bindgen]
pub struct GLTFRendererDemo {
  renderer: Renderer,
  camera_handle: Index,
  canvas: WebGlCanvas,
  turntable: Turntable,
  passes: Vec<Pass>,
}

#[wasm_bindgen]
impl GLTFRendererDemo {
  #[wasm_bindgen(constructor)]
  pub fn new(
    gltf_data: &[u8],
    ground_image: &HtmlImageElement,
    skybox_nx_image: &HtmlImageElement,
    skybox_px_image: &HtmlImageElement,
    skybox_ny_image: &HtmlImageElement,
    skybox_py_image: &HtmlImageElement,
    skybox_nz_image: &HtmlImageElement,
    skybox_pz_image: &HtmlImageElement,
    seed: u32,
  ) -> StdResult<GLTFRendererDemo, JsValue> {
    let canvas = WebGlCanvas::new()?;
    let ctx = Context::new(canvas.gl.clone());
    let gltf = Gltf::from_slice(gltf_data).unwrap();
    let mut turntable = Turntable::new(20.0, 0.01);

    turntable.roll = PI / 4.0;

    let mut renderer = Renderer::new(ctx);

    let camera_handle = renderer.cameras.insert(Camera::default());

    let whale_handles = renderer.bake_gltf(&gltf);

    renderer
      .scene
      .set_parent(whale_handles[0], renderer.scene.get_root_handle());

    let whale_node = renderer.scene.get_node_mut(whale_handles[0]).unwrap();

    whale_node.matrix_local = compose_matrix(
      None,
      Some(UnitQuaternion::from_euler_angles(PI / 2.0, 0.0, 0.0)),
      Some(Vector3::new(1.4, 1.4, 1.4)),
    );

    // info!("whale_handles {:#?}", whale_handles);
    // info!("renderer {:#?}", renderer);

    let skybox_texture = renderer.bake_cube_map_texture(
      TextureFormat::RGB,
      Sampler::default(),
      &[
        (TextureKind::CubeMapNX, skybox_nx_image),
        (TextureKind::CubeMapPX, skybox_px_image),
        (TextureKind::CubeMapNY, skybox_ny_image),
        (TextureKind::CubeMapPY, skybox_py_image),
        (TextureKind::CubeMapNZ, skybox_nz_image),
        (TextureKind::CubeMapPZ, skybox_pz_image),
      ],
    );

    let skybox_geometry_handle = renderer.bake_cuboid_geometry(Vector3::new(1.0, 1.0, 1.0));
    let skybox_material_handle =
      renderer.bake_material(SkyboxMaterial::new(skybox_texture).boxed());

    let skybox_mesh_handle = renderer.compose_mesh(
      skybox_geometry_handle,
      skybox_material_handle,
      Some(String::from("skybox")),
    );

    let mut skybox_node = Node::new(Some(renderer.scene.get_root_handle()));

    skybox_node.mesh = Some(skybox_mesh_handle);

    renderer.insert_node(skybox_node);

    //
    let cuboid_material_handle = renderer.bake_material(
      PbrMaterial::new()
        .set_color(Vector3::new(0.0, 0.0, 1.0))
        .set_debug_cube_map(Some(skybox_texture))
        // .set_color_map(Some(render_target_texture))
        .boxed(),
    );

    let cuboid_geometry_handle = renderer.bake_cuboid_geometry(Vector3::new(2.0, 2.0, 2.0));

    let cuboid_mesh_handle = renderer.compose_mesh(
      cuboid_geometry_handle,
      cuboid_material_handle,
      Some(String::from("cuboid")),
    );

    let mut cuboid_node = Node::new(Some(renderer.scene.get_root_handle()));

    cuboid_node.matrix_local = compose_matrix(Some(Vector3::new(-5.0, 0.0, 0.0)), None, None);
    cuboid_node.mesh = Some(cuboid_mesh_handle);
    cuboid_node.name = Some(String::from("cuboid"));

    renderer.insert_node(cuboid_node);

    //

    let mut sampler = Sampler::default();

    sampler.wrap_s = TexParam::Repeat;
    sampler.wrap_t = TexParam::Repeat;

    let ground_texture_handle = renderer.bake_2d_texture(TextureFormat::RGB, sampler, ground_image);

    let ground_material_handle = renderer.bake_material(
      PbrMaterial::new()
        .set_color(Vector3::new(0.0, 0.8, 0.2))
        .set_cull_face(false)
        .set_color_map(Some(ground_texture_handle))
        .set_uv_repeating(Vector2::new(8.0, 8.0))
        .boxed(),
    );

    let ground_mesh = get_ground_surface_tri_mesh(&Vector3::new(60.0, 20.0, 60.0), seed);

    let ground_geometry_handle = renderer.bake_tri_mesh_geometry(ground_mesh);

    let ground_mesh_handle = renderer.compose_mesh(
      ground_geometry_handle,
      ground_material_handle,
      Some(String::from("ground")),
    );

    let mut ground_node = Node::new(Some(renderer.scene.get_root_handle()));

    ground_node.matrix_local = compose_matrix(Some(Vector3::new(0.0, -15.0, 0.0)), None, None);
    ground_node.mesh = Some(ground_mesh_handle);
    ground_node.name = Some(String::from("ground"));

    renderer.insert_node(ground_node);

    let passes = vec![Pass::new()
      .set_clean_color(true)
      .set_clean_depth(true)
      .set_background_color(Vector4::new(1.0, 1.0, 1.0, 1.0))
      .set_handler(move |renderer| {
        renderer.render_scene(renderer.scene.get_root_handle(), camera_handle);
      })];

    Ok(GLTFRendererDemo {
      camera_handle,
      canvas,
      renderer,
      turntable,
      passes,
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
    let far = 100.0;

    self
      .renderer
      .make_perspective_camera(self.camera_handle, aspect, fovy, near, far);

    self
      .turntable
      .update_camera(&mut self.renderer, self.camera_handle);

    for pass in &self.passes {
      pass.render(&mut self.renderer);
    }
  }
}

fn get_perlin_data(width: usize, height: usize, a: f64, b: f64, seed: u32) -> Vec<f32> {
  let perlin = Perlin::new().set_seed(seed);

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
  let width = 128;
  let height = 128;

  let data = get_perlin_data(width, height, 2.0, 2.0, seed);

  let wf = width as f32;
  let hf = height as f32;

  let mut surface = unit_quad(width - 1, height - 1);

  let coords = &mut surface.coords[..];

  for col in 0..height {
    for row in 0..width {
      let id = row + col * width;
      let x = -size.x / 2.0 + (col as f32 / wf) * size.x;
      let z = -size.z / 2.0 + (row as f32 / hf) * size.z;
      let y =
        (data[id * 4] + data[id * 4 + 1] + data[id * 4 + 2] + data[id * 4 + 3]) / 3.0 * size.y;

      coords[id] = Point3::new(x, y, z);
    }
  }

  surface.recompute_normals();

  surface
}
