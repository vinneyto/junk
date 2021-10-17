import sharp from 'sharp';
import path from 'path';

async function main() {
  const pathToFile = path.resolve(process.argv[2]);
  const pathToDir = path.dirname(pathToFile);
  const image = sharp(pathToFile);
  const meta = await image.metadata();

  extractCubeSize(0, 1, 'nx');
  extractCubeSize(1, 1, 'pz');
  extractCubeSize(2, 1, 'px');
  extractCubeSize(3, 1, 'nz');
  extractCubeSize(1, 0, 'py');
  extractCubeSize(1, 2, 'ny');

  function extractCubeSize(left: number, top: number, name: string) {
    const width = (meta.width || 0) / 4;
    const height = (meta.height || 0) / 3;
    const sideFileName = path.join(pathToDir, `${name}.jpg`);

    const w = getPowOfTwo(width);
    const h = getPowOfTwo(height);

    image
      .extract({ left: left * width, top: top * height, width, height })
      .clone()
      .resize(w, h)
      .toFile(sideFileName, () => {
        console.log(
          `save: ${path.basename(sideFileName)}, width = ${w}, height = ${h}`
        );
      });
  }
}

function getPowOfTwo(x: number) {
  return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
}

main();
