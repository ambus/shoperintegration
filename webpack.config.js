var path = require("path");

var Webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
module.exports = {
  mode: "production",
  devtool: "source-map",
  target: "node",
  entry: "./src/index.ts",
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".js", ".json"]
  },
  externals: nodeModules,
  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: false,
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader"
      }
    ]
  },
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "dist")
  }
};
