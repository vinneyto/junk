import path from 'path';
import CompressionPlugin from 'compression-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const debug = process.env.NODE_ENV !== 'production';

const plugins = [
  new HtmlWebpackPlugin({
    title: 'three-shader',
    favicon: './assets/favicon.ico',
    meta: {
      viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
    },
    hash: !debug,
  }),
  new CleanWebpackPlugin(),
  new FriendlyErrorsWebpackPlugin(),
  new MiniCssExtractPlugin(),
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
  context: path.resolve('./src'),
  entry: './index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve('./dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      { test: /\.ts/, loader: 'ts-loader' },
      {
        test: /\.css/,
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { hmr: debug } },
          'css-loader',
        ],
      },
      { test: /\.glsl/, loader: 'raw-loader' },
      { test: /\.gltf/, loader: 'gltf-webpack-loader' },
      { test: /\.bin|png|svg|jpg|gif/, loader: 'file-loader' },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9000,
    open: true,
    noInfo: true,
  },
  plugins,
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /node_modules/,
          filename: 'vendors.js',
          chunks: 'all',
        },
      },
    },
  },
};
