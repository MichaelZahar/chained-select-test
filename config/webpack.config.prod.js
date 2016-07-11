const path = require('path');
const webpack = require('webpack');
const nib = require('nib');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const PATHS = {
  app: path.resolve(__dirname, '../src/client/js'),
  styles: path.resolve(__dirname, '../src/client/styles'),
  images: path.resolve(__dirname, '../src/client/images'),
  build: path.resolve(__dirname, '../build')
};

const plugins = [
  new webpack.optimize.CommonsChunkPlugin('vendor', 'js/vendor.bundle.js'),
  new CopyWebpackPlugin([
    {
      from: PATHS.images,
      to: 'images'
    }
  ]),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
  }),
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }),
  // This plugin moves all the CSS into a separate stylesheet
  new ExtractTextPlugin('css/app.css', { allChunks: true })
];

module.exports = {
  devtool: 'cheap-module-source-map',
  // devtool: 'source-map',

  entry: {
    bundle: path.resolve(PATHS.app, 'index.js'),
    vendor: ['react']
  },

  output: {
    path: PATHS.build,
    filename: 'js/[name].js',
    publicPath: '/'
  },

  resolve: {
    extensions: ['', '.js', '.styl', '.css']
  },

  module: {
    noParse: /\.min\.js$/,
    loaders: [
      {
        test: /\.js?$/,
        loaders: ['babel-loader'],
        include: PATHS.app
      },
      {
        test: /\.css?$/,
        loaders: [ 'style', 'raw' ]
      },
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!stylus-loader')
      },
      {
        test: /\.css$/,
        include: PATHS.styles,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader')
      }
    ]
  },
  stylus: {
    use: [nib()],
    import: [path.resolve(__dirname, '../node_modules/nib/lib/nib/index.styl')]
  },
  plugins: plugins
};
