use noise::{NoiseFn, Perlin, Seedable};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_perlin_data(width: usize, height: usize, a: f64, b: f64, seed: u32) -> Vec<f32> {
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
