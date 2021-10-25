export interface Context {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  queue: GPUQueue;
  width: number;
  height: number;
  presentationFormat: GPUTextureFormat;
  renderTarget: GPUTexture;
  renderTargetView: GPUTextureView;
  depthTexture: GPUTexture;
  depthTextureView: GPUTextureView;
  sampleCount: number;
}
