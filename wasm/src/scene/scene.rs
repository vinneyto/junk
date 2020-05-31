use generational_arena::{Arena, Index};
use na::Isometry3;

use super::node::Node;

#[derive(Debug)]
pub struct Scene {
  root_handle: Index,
  nodes: Arena<Node>,
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

  pub fn update_world_isometry(&mut self) -> Option<()> {
    let root = self.get_node(self.root_handle)?;
    let root_isometry = root.isometry;
    self.update_world_isometry_subtree(self.root_handle, &root_isometry)
  }

  pub fn update_world_isometry_subtree(
    &mut self,
    handle: Index,
    parent_isometry: &Isometry3<f32>,
  ) -> Option<()> {
    let node = self.get_node_mut(handle)?;

    let node_isometry = Isometry3::new(node.position, node.rotation.scaled_axis());
    let world_isometry = parent_isometry * node_isometry;
    let children = node.children.clone();

    node.isometry = world_isometry;

    for child_handle in children {
      self.update_world_isometry_subtree(child_handle, &world_isometry)?;
    }

    Some(())
  }

  pub fn collect_visible_items(&self) -> Vec<(Index, Index)> {
    let mut items: Vec<(Index, Index)> = vec![];

    self.collect_visible_items_subtree(self.root_handle, &mut items);

    items
  }

  pub fn collect_visible_items_subtree(
    &self,
    handle: Index,
    items: &mut Vec<(Index, Index)>,
  ) -> Option<()> {
    let node = self.get_node(handle)?;

    if node.visible {
      if let Some(mesh_handle) = node.mesh {
        items.push((handle, mesh_handle));
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
