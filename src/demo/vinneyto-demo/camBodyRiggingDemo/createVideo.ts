export async function createVideo() {
  const video = document.createElement('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720, facingMode: 'user' },
  });

  video.srcObject = stream;
  video.width = 1280;
  video.height = 720;
  await video.play();

  return video;
}
