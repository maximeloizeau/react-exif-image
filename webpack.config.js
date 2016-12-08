const merge             = require('lodash.merge');
const path              = require('path');
const webpack           = require('webpack');

// DIRs & ENVs
const SRC_DIR = path.resolve('./src');
const BUILD_DIR = path.resolve('./build/');
const NODE_MODULES_DIR = path.resolve('./node_modules');

// Loaders
const phonyExtractLoader = {
  extract: function(value) {
    return value;
  },
};

const config = {
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    sourcePrefix: '\t',
    crossOriginLoading: 'anonymous',
    library: 'testConfig',
    libraryTarget: 'commonjs2'
  },

  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true),
  ],

  resolve: {
    alias: {
      'react': path.join(__dirname, 'node_modules', 'react')
    },
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
    root: SRC_DIR,
  },

  module: {
    loaders: [
      {
        test: /\.(jsx|js)?$/,
        include: SRC_DIR,
        loaders: ['babel-loader']
      }
    ]
  }
};

const appConfig = merge({}, config, {
  entry: './src/index.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'index.js'
  }
});

module.exports = appConfig;
