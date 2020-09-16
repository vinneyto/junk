import { PlaneBufferGeometry, Vector2, Vector3 } from 'three';

export async function buildPerlinSurfaceGeometry(
  size: Vector3,
  segments: Vector2
) {
  const { get_perlin_data } = await import('../../../../wasm/pkg');
  const { x: width, y: height } = segments;

  const data = get_perlin_data(
    segments.x,
    segments.y,
    2.0,
    2.0,
    Math.round(Math.random() * 100)
  );

  const geometry = new PlaneBufferGeometry(
    size.x,
    size.z,
    width - 1,
    height - 1
  );
  geometry.rotateX(-Math.PI / 2);

  const point = new Vector3();
  const position = geometry.attributes.position.array as Float32Array;

  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      const id = col + row * height;
      point.x = -size.x / 2.0 + (col / width) * size.x;
      point.z = -size.z / 2.0 + (row / height) * size.z;
      point.y =
        ((data[id * 4] +
          data[id * 4 + 1] +
          data[id * 4 + 2] +
          data[id * 4 + 3]) /
          3.0) *
        size.y;
      point.toArray(position, id * 3);
    }
  }

  geometry.computeVertexNormals();

  return geometry;
}
