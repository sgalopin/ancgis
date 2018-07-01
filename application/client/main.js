// The following code will enable all tooltips in the document
$(document).ready(function(){
  $("[data-toggle=\"tooltip\"]").tooltip();
});

// Open the database
require("./ancgis/dbms/indexedDB");

// Open the sig
window.ancgis = require("./ancgis/map/sig");

// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/cache.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}