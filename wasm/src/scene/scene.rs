use generational_arena::{Arena, Index};
use na::{Isometry3, Matrix4, Vector4};
use std::default::Default;

use super::node::Node;

#[derive(Debug)]
pub struct Scene {
  root_handle: Index,
  nodes: Arena<Node>,
}

impl Default for Scene {
  fn default() -> Self {
    Self::new()
  }
}

impl Scene {
  pub fn new() -> Self {
    let mut nodes: Arena<Node> = Arena::new();
    let root_object = Node::new(None);
    let root_handle = nodes.insert(root_object);

    Scene { nodes, root_handle }
  }

  pub fn insert(&mut self, object: Node) -> Index {
    let parent_handle_options = object.parent;
    let handle = self.nodes.insert(object);

    if let Some(parent_handle) = parent_handle_options {
      let parent = self.nodes.get_mut(parent_handle).unwrap();
      parent.children.push(handle);
    }

    handle
  }

  pub fn set_parent(&mut self, child_handle: Index, parent_handle: Index) {
    if let Some(current_parent_handle) = self.get_parent_handle(child_handle) {
      let parent = self.get_node_mut(current_parent_handle).unwrap();

      parent.children.retain(|ch| *ch != child_handle);
    }

    let child = self.get_node_mut(child_handle).unwrap();

    child.parent = Some(parent_handle);

    let parent = self.get_node_mut(parent_handle).unwrap();

    parent.children.push(child_handle);
  }

  fn remove_subtree(&mut self, handle: Index) -> Option<()> {
    let node = self.get_node(handle)?;
    let children = node.children.clone();

    for child_handle in children {
      self.remove_subtree(child_handle);
    }

    self.nodes.remove(handle);

    Some(())
  }

  pub fn remove(&mut self, handle: Index) -> Option<()> {
    if handle == self.root_handle {
      panic!("cant remove root node");
    }

    self.remove_subtree(handle);

    let parent_handle = self.get_parent_handle(handle)?;
    let parent = self.nodes.get_mut(parent_handle).unwrap();

    parent
      .children
      .retain(|child_handle| *child_handle != handle);

    Some(())
  }

  pub fn update_matrix_world(&mut self) -> Option<()> {
    let root = self.get_node(self.root_handle)?;
    let matrix_world = root.matrix_world;
    self.update_matrix_world_subtree(self.root_handle, &matrix_world)
  }

  pub fn update_matrix_world_subtree(
    &mut self,
    handle: Index,
    parent_matrix_world: &Matrix4<f32>,
  ) -> Option<()> {
    let node = self.get_node_mut(handle)?;

    let node_isometry = Isometry3::new(node.position, node.rotation.scaled_axis());
    let node_scale_matrix = Matrix4::from_diagonal(&Vector4::new(
      node.scale[0],
      node.scale[1],
      node.scale[2],
      1.0,
    ));
    let matrix_local = node_isometry.to_homogeneous() * node_scale_matrix;
    let matrix_world = parent_matrix_world * matrix_local;
    let children = node.children.clone();

    node.matrix_world = matrix_world;

    for child_handle in children {
      self.update_matrix_world_subtree(child_handle, &matrix_world)?;
    }

    Some(())
  }

  pub fn collect_visible_items(&self) -> Vec<Index> {
    let mut items: Vec<Index> = vec![];

    self.collect_visible_items_subtree(self.root_handle, &mut items);

    items
  }

  pub fn collect_visible_sub_items(&self, parent_handle: Index) -> Vec<Index> {
    let mut items: Vec<Index> = vec![];

    self.collect_visible_items_subtree(parent_handle, &mut items);

    items
  }

  pub fn collect_visible_items_subtree(&self, handle: Index, items: &mut Vec<Index>) -> Option<()> {
    let node = self.get_node(handle)?;

    if node.visible {
      if node.mesh.is_some() {
        items.push(handle);
      }

      for child_handle in &node.children {
        self.collect_visible_items_subtree(*child_handle, items);
      }
    }

    Some(())
  }

  pub fn get_node(&self, handle: Index) -> Option<&Node> {
    self.nodes.get(handle)
  }

  pub fn get_node_mut(&mut self, handle: Index) -> Option<&mut Node> {
    self.nodes.get_mut(handle)
  }

  pub fn get_parent_handle(&self, handle: Index) -> Option<Index> {
    let node = self.nodes.get(handle)?;
    node.parent
  }

  pub fn get_root_handle(&self) -> Index {
    self.root_handle
  }
}
