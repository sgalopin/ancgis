const path = require("path");
const webpack = require("webpack");

module.exports = {
  // TODO: test if https, cert and key params are used per webpack-hot-middleware
  //https: true,
  //cert: "./encryption/ancgis.dev.net.crt",
  //key: "./encryption/ancgis.dev.net.key",
  mode: "development",
  entry: { // https://webpack.js.org/guides/code-splitting/
    app: ["./client/main.js"],
    tools: ["./client/tools-main.js"]
  },
  devtool: "inline-source-map",
  output: {
    filename: "[name].bundle.js",
    //path: path.resolve(__dirname, "public/javascripts"),
    path: "/home/vagrant", // Must be set out of the application folder to avoid recursive restart
    publicPath: "/javascripts" //  Required per webpack-dev-middleware
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [{
        loader: "style-loader",
        options: {
          sourceMap: true,
          insertAt: "top"
        }
      },{
        loader: "css-loader"
      }]
    },{
      test: /\.hbs$/,
      loader: "handlebars-loader"
    },{
      test: /^\.\/application\/.*\.json$/,
      loader: "json-loader"
    }]
  }
};