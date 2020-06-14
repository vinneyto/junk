use na::Vector3;

#[derive(Debug, Clone)]
pub struct PBRMaterialParams {
  pub color: Vector3<f32>,
}

#[derive(Debug, Clone)]
pub enum Material {
  PBR(PBRMaterialParams),
}
