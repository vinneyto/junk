use super::debug_material_params::DebugMaterialParams;

#[derive(Debug, Clone)]
pub enum Material {
  Debug(DebugMaterialParams),
}
