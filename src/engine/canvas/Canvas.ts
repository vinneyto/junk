interface Styles {
  [key: string]: string;
}

export class Canvas {
  private canvas: HTMLCanvasElement;

  constructor(styles: Styles) {
    this.canvas = document.createElement('canvas');

    for (const [key, value] of Object.entries(styles)) {
      // @ts-ignore
      this.canvas.style[key] = value;
    }

    document.body.appendChild(this.canvas);
  }

  resize(): boolean {
    const { width, height, clientWidth, clientHeight } = this.canvas;
    const { devicePixelRatio } = window;

    const displayWidth = Math.floor(clientWidth * devicePixelRatio);
    const displayHeight = Math.floor(clientHeight * devicePixelRatio);

    const sizeChanged = width !== displayWidth || height !== displayHeight;

    if (sizeChanged) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }

    return sizeChanged;
  }

  getCanvasElement(): HTMLCanvasElement {
    return this.canvas;
  }

  getWebGLContext(): WebGLRenderingContext {
    const context = this.canvas.getContext('webgl');

    if (context === null) {
      throw new Error('Cannot get webgl canvas context');
    }

    return context;
  }
}
