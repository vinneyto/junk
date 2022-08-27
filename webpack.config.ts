import path from 'path';
import CompressionPlugin from 'compression-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WasmPackPlugin from '@wasm-tool/wasm-pack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const debug = process.env.NODE_ENV !== 'production';

const plugins = [
  new HtmlWebpackPlugin({
    title: 'junk',
    favicon: './assets/favicon.ico',
    meta: {
      viewport: 'width=device-width, initial-scale=1, user-scalable=no',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'origin-trial': {
        'http-equiv': 'origin-trial',
        content:
          'AmlDllrMqRvuQldoVPWF4Pj7QgF+ARtOEsQwJ1JOMApsdmrD2Ca2yoToRyhCcRrNgCTuXo+efG6JX3zQdht+EAcAAABmeyJvcmlnaW4iOiJodHRwczovL3d3dy50aGFuZWRkLWdwdS5jb206NDQzIiwiZmVhdHVyZSI6IldlYkdQVSIsImV4cGlyeSI6MTY0MzE1NTE5OSwiaXNTdWJkb21haW4iOnRydWV9',
      },
    },
  }),
  new MiniCssExtractPlugin({
    filename: debug ? '[name].css' : '[name].[chunkhash].css',
  }),
  new WasmPackPlugin({
    crateDirectory: path.join(__dirname, 'wasm'),
    forceMode: 'production',
  }),
  new CleanWebpackPlugin(),
  // new BundleAnalyzerPlugin(),
];

if (!debug) {
  plugins.push(
    new CompressionPlugin({
      test: /\.js/,
    })
  );
}

export default {
  mode: debug ? 'development' : 'production',
  devtool: 'eval',
  context: path.resolve('./src'),
  entry: {
    main: './index.ts',
  },
  output: {
    filename: debug ? '[name].js' : '[name].[chunkhash].js',
    path: path.resolve('./dist'),
  },
  resolve: {
    alias: {
      three: path.resolve('./node_modules/three'),
    },
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.tfm$/,
        loader: 'tf-model-loader',
      },
      {
        test: /\.css/,
        use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader'],
      },
      { test: /\.glsl|wgsl/, loader: 'raw-loader' },
      { test: /\.gltf/, loader: 'gltf-webpack-loader' },
      { test: /\.bin|png|svg|jpg|jpeg|gif|glb/, loader: 'file-loader' },
    ],
  },
  stats: 'errors-only',
  devServer: {
    port: 9000,
    open: true,
    hot: false,
    liveReload: false,
    historyApiFallback: true,
  },
  plugins,
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: true,
  },
  experiments: {
    asyncWebAssembly: true,
  },
  resolveLoader: {
    alias: {
      'tf-model-loader': path.resolve(__dirname, 'tools/tf-model-loader.ts'),
    },
  },
};
