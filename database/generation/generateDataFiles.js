// Imports
const fs = require('fs');
const generateTaxonsFct = require('./taxons/generateTaxonsFile');

// Files parameters
var cfg = JSON.parse(fs.readFileSync("config.json"));

// Generates the js data files
// Taxons
generateTaxonsFct(cfg.taxonsInputFileName, cfg.taxonsOutputFileName);
