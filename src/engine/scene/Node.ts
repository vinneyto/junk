import { Mesh } from './Mesh';
import { Vector3, Quaternion, Matrix4 } from '../math';

export class Node {
  public readonly mesh?: Mesh;

  public parent?: Node;
  public readonly children: Node[] = [];

  public readonly position = new Vector3();
  public readonly quaternion = new Quaternion();
  public readonly scale = new Vector3(1, 1, 1);

  private readonly matrixLocal = new Matrix4();
  public readonly matrixWorld = new Matrix4();

  public visible: boolean = true;

  add(child: Node): void {
    child.parent = this;
    this.children.push(child);
  }

  remove(child: Node): void {
    child.parent = undefined;
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  updateMatrixWorld(): void {
    this.matrixLocal.compose(this.position, this.quaternion, this.scale);

    if (this.parent !== undefined) {
      this.matrixWorld.multiplyMatrices(
        this.parent.matrixWorld,
        this.matrixLocal
      );
    } else {
      this.matrixWorld.copy(this.matrixLocal);
    }

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].updateMatrixWorld();
    }
  }

  collectVisibleNodes(): Node[] {
    const nodes: Node[] = [];

    if (this.visible) {
      nodes.push(this);
    }

    for (let i = 0; i < this.children.length; i++) {
      nodes.push(...this.children[i].collectVisibleNodes());
    }

    return nodes;
  }
}
