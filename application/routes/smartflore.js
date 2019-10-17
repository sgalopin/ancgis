var express = require("express");
var request = require('request');

var router = express.Router(); // eslint-disable-line new-cap

function loggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/");
    }
}

router.get("/:urn", function (req, res) {

  // Proxy setting
  var proxy = process.env.http_proxy || null;
  console.log('proxy server %j', proxy);
  // https://fr.wikipedia.org/wiki/
  // https://inpn.mnhn.fr/espece/cd_nom/

  request({
      url: 'https://www.tela-botanica.org/eflore/consultation/index_mobile.php?module=mobile&referentiel=bdtfx&num_nom=' + req.params.urn,
      proxy: proxy
  }, function (error, response, body) {
      if (error) {
          console.log(error);
      } else {
        const re = new RegExp('modules/mobile/presentations/', 'g');
        const content = response.body.replace(re, 'https://tela-botanica.org/eflore/consultation/modules/mobile/presentations/')
                        .replace('</head>', '<link href="/stylesheets/smartflore.css" type="text/css" rel="stylesheet"></head>');
        res.send(content);
      }
  });
});

module.exports = router;
