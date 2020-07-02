use noise::{NoiseFn, Perlin, Seedable};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PerlinNoise {
  perlin: Perlin,
}

#[wasm_bindgen]
impl PerlinNoise {
  #[wasm_bindgen(constructor)]
  pub fn new() -> Self {
    let perlin = Perlin::new();

    PerlinNoise { perlin }
  }

  pub fn get_data(&self, width: usize, height: usize, a: f64, b: f64) -> Vec<u8> {
    let mut data = vec![0; width * height * 4];

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
          let val = self.perlin.get([x * freq, y * freq]) / scale;
          sum += val;
          let result = (sum + 1.0) / 2.0;

          data[((row * width + col) * 4) + oct] = (result * 255.0) as u8;
          freq *= 2.0;
          scale *= b;
        }
      }
    }

    data
  }

  pub fn set_seed(&mut self, seed: u32) {
    self.perlin = self.perlin.set_seed(seed);
  }
}
