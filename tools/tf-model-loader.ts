import * as path from 'path';
import * as fs from 'fs';
import { LoaderDefinitionFunction } from 'webpack';

interface TFModel {
  weightsManifest?: Array<{ paths?: string[] }>;
}

const tfModelLoader: LoaderDefinitionFunction = function (source: string) {
  const model: TFModel = JSON.parse(source);

  const jsonFileName = path.basename(this.resourcePath);
  const jsonBuffer = fs.readFileSync(this.resourcePath);
  const jsonAssetInfo = { sourceFilename: this.resourcePath };
  this.emitFile(jsonFileName, jsonBuffer, undefined, jsonAssetInfo);

  const dirName = path.dirname(this.resourcePath);

  model.weightsManifest?.forEach((wm) => {
    wm?.paths?.forEach((p) => {
      const assetInfo = { sourceFilename: path.join(dirName, p) };
      const buffer = fs.readFileSync(assetInfo.sourceFilename);
      const fileName = path.basename(assetInfo.sourceFilename);

      this.emitFile(fileName, buffer, undefined, assetInfo);
    });
  });

  return `export default ${JSON.stringify(jsonFileName)};`;
};

export default tfModelLoader;
