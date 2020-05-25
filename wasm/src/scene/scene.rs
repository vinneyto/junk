use generational_arena::{Arena, Index};

use super::node::Node;

#[derive(Debug)]
pub struct Scene {
  root_handle: Index,
  objects: Arena<Node>,
}

impl Scene {
  pub fn new() -> Self {
    let mut objects: Arena<Node> = Arena::new();
    let root_object = Node::new(None);
    let root_handle = objects.insert(root_object);

    Scene {
      objects,
      root_handle,
    }
  }
}
