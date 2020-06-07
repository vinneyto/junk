import { mat4, vec3, quat } from 'gl-matrix';
import { Mesh } from 'three';

export class Node {
  public parent?: Node;
  public children: Node[] = [];
  public position: vec3 = vec3.create();
  public rotation: quat = quat.create();
  public scale: vec3 = vec3.create();
  public matrixLocal: mat4 = mat4.create();
  public matrixWorld: mat4 = mat4.create();
  public visible: boolean = true;
  public mesh?: Mesh;

  public updateMatrixLocal() {
    mat4.fromRotationTranslationScale(
      this.matrixLocal,
      this.rotation,
      this.position,
      this.scale
    );
  }

  public updateMatrixWorld() {
    this.updateMatrixLocal();

    if (this.parent !== undefined) {
      mat4.multiply(
        this.matrixWorld,
        this.parent.matrixWorld,
        this.matrixLocal
      );

      for (const child of this.children) {
        child.updateMatrixWorld();
      }
    } else {
      mat4.copy(this.matrixWorld, this.matrixLocal);
    }
  }

  public add(node: Node) {
    if (node.parent !== undefined) {
      node.parent.remove(node);
    }

    node.parent = this;
    this.children.push(node);
  }

  public remove(node: Node) {
    const nodeIdx = this.children.indexOf(node);
    if (nodeIdx !== -1) {
      this.children.splice(nodeIdx, 1);
      node.parent = undefined;
    }
  }

  public collectVisibleNodes(nodes: Node[]) {
    if (this.visible) {
      if (this.mesh !== undefined) {
        nodes.push(this);
      }

      for (const child of this.children) {
        child.collectVisibleNodes(nodes);
      }
    }
  }
}
