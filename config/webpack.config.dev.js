const path = require('path');
const webpack = require('webpack');
const nib = require('nib');

const PATHS = {
  app: path.resolve(__dirname, '../src/client/js'),
  styles: path.resolve(__dirname, '../src/client/styles'),
  build: path.resolve(__dirname, '../build')
};

const plugins = [
  new webpack.optimize.CommonsChunkPlugin('vendor', 'js/vendor.bundle.js'),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
    __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
  }),
  new webpack.optimize.OccurenceOrderPlugin()
];

module.exports = {
  devtool: 'cheap-module-eval-source-map',
  env: process.env.NODE_ENV,
  entry: {
    bundle: path.resolve(PATHS.app, 'index.js'),
    vendor: ['react']
  },
  output: {
    path: PATHS.build,
    filename: 'js/[name].js',
    publicPath: '/'
  },
  stats: {
    colors: true,
    reasons: true
  },
  resolve: {
    extensions: ['', '.js', '.styl', '.css']
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        loaders: ['react-hot', 'babel'],
        include: PATHS.app
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!css-loader!stylus-loader'
      },
      {
        test: /\.css?$/,
        loaders: [ 'style', 'raw' ]
      }
    ]
  },
  plugins: plugins,
  stylus: {
    use: [nib()],
    import: [path.resolve(__dirname, '../node_modules/nib/lib/nib/index.styl')]
  },
  devServer: {
    contentBase: path.resolve(__dirname, '../src/client'),
    port: 3000,
    historyApiFallback: true
  }
};
