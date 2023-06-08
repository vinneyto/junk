import {
  PlaneGeometry,
  Vector2,
  Vector3,
  Scene,
  OrthographicCamera,
  Mesh,
  Texture,
  MeshBasicMaterial,
  WebGLRenderer,
  BufferAttribute,
} from 'three';

export async function buildPerlinSurfaceGeometry(
  size: Vector3,
  segments: Vector2
) {
  const { get_perlin_data } = await (
    await import('../../../../wasm/pkg')
  ).default;
  const { x: width, y: height } = segments;

  const data = get_perlin_data(
    segments.x,
    segments.y,
    3.0,
    2.0,
    Math.round(Math.random() * 100)
  );

  const geometry = new PlaneGeometry(size.x, size.z, width - 1, height - 1);
  geometry.rotateX(-Math.PI / 2);

  const point = new Vector3();
  const position = (geometry.attributes.position as BufferAttribute)
    .array as Float32Array;

  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      const id = col + row * height;
      point.x = -size.x / 2.0 + (col / (width - 1)) * size.x;
      point.z = -size.z / 2.0 + (row / (height - 1)) * size.z;
      point.y =
        ((data[id * 4] +
          data[id * 4 + 1] +
          data[id * 4 + 2] +
          data[id * 4 + 3]) /
          3.0) *
        size.y;
      const xr = 1 - ((point.x / size.x) * 2.0) ** 8;
      const yr = 1 - ((point.z / size.z) * 2.0) ** 8;
      point.y *= xr * yr;
      point.toArray(position, id * 3);
    }
  }

  geometry.computeVertexNormals();

  return geometry;
}

export class Preview extends Scene {
  private readonly camera: OrthographicCamera;
  private readonly mesh: Mesh;
  private readonly backMesh: Mesh;

  constructor(texture: Texture) {
    super();

    const g = new PlaneGeometry(1, 1);
    const m = new MeshBasicMaterial({ map: texture });
    this.mesh = new Mesh(g, m);
    this.add(this.mesh);

    this.backMesh = new Mesh(g, new MeshBasicMaterial({ color: 'black' }));
    this.add(this.backMesh);

    this.camera = new OrthographicCamera(0, 0, 0, 0, -10, 10);
  }

  resize(renderer: WebGLRenderer, index: number) {
    const { width, height } = renderer.domElement;
    this.camera.right = width;
    this.camera.top = height;
    this.camera.updateProjectionMatrix();

    const aspect = width / height;
    const size = width * 0.1;
    const gap = 40 * window.devicePixelRatio;

    this.mesh.scale.set(size * aspect, size, 1);
    this.mesh.position.set(
      this.mesh.scale.x / 2 + gap + index * (this.mesh.scale.x + gap),
      height - this.mesh.scale.y / 2 - gap,
      0
    );

    this.backMesh.scale.set(
      this.mesh.scale.x + 2 * window.devicePixelRatio,
      this.mesh.scale.y + 2 * window.devicePixelRatio,
      1
    );

    this.backMesh.position.copy(this.mesh.position);
    this.backMesh.position.z = -1;
  }

  render(renderer: WebGLRenderer) {
    renderer.autoClearColor = false;
    renderer.render(this, this.camera);
    renderer.autoClearColor = true;
  }
}
