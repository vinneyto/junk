use generational_arena::Index;
use std::collections::HashMap;

use super::shader::AttributeOptions;

#[derive(Debug, Clone)]
pub struct Attribute {
  pub buffer: Index,
  pub options: AttributeOptions,
}

#[derive(Debug, Clone, Hash, Eq, PartialEq)]
pub enum AttributeName {
  Position,
  Normal,
  Uv,
  Unknown(String),
}

impl AttributeName {
  pub fn from_string(name: &str) -> Self {
    match name {
      "position" => AttributeName::Position,
      "normal" => AttributeName::Normal,
      "uv" => AttributeName::Uv,
      _ => panic!("unknown attribute {}", name),
    }
  }
}

#[derive(Debug, Clone)]
pub struct Geometry {
  pub attributes: HashMap<AttributeName, Attribute>,
  pub indices: Option<Attribute>,
  pub count: i32,
}
