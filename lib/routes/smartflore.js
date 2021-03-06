/**
 * AncGIS - Web GIS for the analysis of honey resources around an apiary
 * Copyright (C) 2020  Sylvain Galopin
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

  const url = 'https://www.tela-botanica.org/eflore/consultation/index_mobile.php?module=mobile&referentiel=bdtfx&num_nom=' + req.params.urn;
  console.log('URL %j', url);

  request({
      url: url,
      proxy: proxy
  }, function (error, response, body) {
      if (error) {
          console.log(error);
      } else {
        console.log('Response obtained. Data processing...');
        const re = new RegExp('modules/mobile/presentations/', 'g');
        const content = response.body.replace(re, 'https://tela-botanica.org/eflore/consultation/modules/mobile/presentations/')
                        .replace('</head>', '<link href="/stylesheets/smartflore.css" type="text/css" rel="stylesheet"></head>')
                        .replace('https://resources.tela-botanica.org/bootstrap/3.3.4/css/bootstrap.min.css', 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css');
        res.send(content);
      }
  });
});

module.exports = router;
