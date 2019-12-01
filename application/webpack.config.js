const path = require("path");
const webpack = require("webpack");
const result = require("dotenv").config();
if (result.error) { throw result.error; }
const env = process.env.NODE_ENV || "production";

module.exports = {
  // TODO: test if https, cert and key params are used per webpack-hot-middleware
  //https: true,
  //cert: "./encryption/ancgis.dev.net.crt",
  //key: "./encryption/ancgis.dev.net.key",
  // Chosen mode tells webpack to use its built-in optimizations accordingly.
  // "production" | "development" | "none"
  mode: env,
  entry: { // https://webpack.js.org/guides/code-splitting/
    app: ["./lib/client/main.js"],
    tools: ["./lib/client/tools-main.js"]
  },
  devtool: env === "development" ? "inline-source-map" : "none",
  output: env !== "production" ? {
    filename: "[name].bundle.js",
    path: "/home/vagrant", // Must be set out of the application folder to avoid recursive restart
    publicPath: "/javascripts" //  Required per webpack-dev-middleware
  } : {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "lib/public/javascripts")
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
      loader: "handlebars-loader",
      query: {
        helperDirs: [
          path.resolve(__dirname, "lib/views/helpers")
        ]
      }
    },{
      test: /^\.\/application\/.*\.json$/,
      loader: "json-loader"
    }]
  },
  "resolve": {
    "alias": {
      "@environment$": `${__dirname}/lib/client/ancgis/env/${env}.js`
    }
  }
};
