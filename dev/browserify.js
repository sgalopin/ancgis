// https://www.npmjs.com/package/browserify-row-flow
// https://www.npmjs.com/package/ol#getting-started
// https://github.com/openlayers/ol-browserify
var fs = require("fs");
var browserify = require("browserify");
var bundler = browserify("./client/main.js", {debug: true})
  .transform("hbsfy", {
    traverse: true
  })
  .transform("babelify", {
    global: true, // required per openlayers
    presets: ["@babel/preset-env"]
  })
  .transform("uglifyify", { global: true  })
  .bundle()
  .pipe(fs.createWriteStream("./client/bundle-debug.js"));
