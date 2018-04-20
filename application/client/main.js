// The following code will enable all tooltips in the document
$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();
});

// Define a namespace for the application.
anc = window.anc ? anc : {};
anc.idbms = require('./anc/dbms/indexedDB');
require('./anc/map/sig');
