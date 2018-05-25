// The following code will enable all tooltips in the document
$(document).ready(function(){
  $("[data-toggle=\"tooltip\"]").tooltip();
});

// Open the database
require("./ancgis/dbms/indexedDB");

// Open the sig
window.ancgis = require("./ancgis/map/sig");