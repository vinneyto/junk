import { Camera, Vector3, Vector2 } from 'three';

export class CameraController {
  private azimuthalAngle = 0;
  private polarAngle = 0;

  constructor(
    private readonly radius = 0.3,
    private readonly sensitivity = 0.01,
    private readonly center = new Vector3(0, 0, 0)
  ) {
    let lastCoords = new Vector2();

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      lastCoords = new Vector2();
      if (e instanceof TouchEvent) {
        lastCoords.set(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        );
      } else {
        lastCoords.set(e.clientX, e.clientY);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onMouseMove);
      document.addEventListener('touchend', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const coords = new Vector2();
      if (e instanceof TouchEvent) {
        coords.set(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      } else {
        coords.set(e.clientX, e.clientY);
      }
      const delta = coords.clone().sub(lastCoords);

      this.rotateDelta(delta);

      lastCoords = coords;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onMouseMove);
      document.removeEventListener('touchend', onMouseUp);
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('touchstart', onMouseDown);
  }

  update(camera: Camera) {
    const theta = this.polarAngle;
    const phi = this.azimuthalAngle;
    const r = this.radius;
    const { sin, cos, abs } = Math;

    const position = new Vector3(
      r * cos(abs(theta)) * sin(phi),
      r * sin(theta),
      r * cos(abs(theta)) * cos(phi)
    );

    camera.position.copy(position);
    camera.lookAt(0, 0, 0);
    camera.position.add(this.center);
  }

  rotateDelta(delta: Vector2) {
    const polarAngle = this.polarAngle + delta.y * this.sensitivity;
    const azimuthalAngle = this.azimuthalAngle - delta.x * this.sensitivity;

    this.setRotation(polarAngle, azimuthalAngle);
  }

  setRotation(polarAngle: number, azimuthalAngle: number) {
    const { PI } = Math;
    const round = PI * 2;
    const bound = Math.PI / 2;

    this.polarAngle = Math.min(bound, Math.max(-bound, polarAngle % round));
    this.azimuthalAngle = azimuthalAngle % round;
  }
}
