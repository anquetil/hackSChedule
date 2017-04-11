var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'build');
var PUBLIC_DIR = path.resolve(__dirname, 'public');

var jsx_loader = {
  test: /\.jsx?$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  query: {
    presets: ['es2015', 'react'],
    plugins: ['transform-object-rest-spread']
  }
};

var json_loader = {
	test: /\.json$/,
	loader: 'json-loader'
};

module.exports = {
	devtool: 'source-map',
  entry: [
		'react-hot-loader/patch',
		PUBLIC_DIR + '/index.js'
	],
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module: {
    loaders: [jsx_loader, json_loader]
  },
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	],
	devServer: {
		historyApiFallback: true,
		hot: true
	}
};
