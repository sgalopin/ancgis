// The following code will enable all tooltips in the document
$(document).ready(function(){
  $("[data-toggle=\"tooltip\"]").tooltip();
});

// Open the database
require("./anc/dbms/indexedDB");

// Open the sig
require("./anc/map/sig");