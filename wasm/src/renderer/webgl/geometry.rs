use generational_arena::Index;
use std::collections::HashMap;

use super::shader::{AttributeName, AttributeOptions};

#[derive(Debug, Clone)]
pub struct Attribute {
  pub buffer: Index,
  pub options: AttributeOptions,
}

#[derive(Debug, Clone)]
pub struct Geometry {
  pub attributes: HashMap<AttributeName, Attribute>,
  pub indices: Option<Attribute>,
  pub count: i32,
}
