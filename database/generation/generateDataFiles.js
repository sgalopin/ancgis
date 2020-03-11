// Imports
const fs = require('fs');
const generateTaxonsFct = require('./taxons/generateTaxonsFile');
const generatePedoclimaticzonesFct = require('./pedoclimaticzone/generatePedoclimaticFile');

// Files parameters
var cfg = JSON.parse(fs.readFileSync("config.json"));

// Generates the js data files
// Taxons
generateTaxonsFct(cfg.taxonsInputFileName, cfg.taxonsOutputFileName);

// PedoclimaticZones
generateTaxonsFct(cfg.pedoclimaticzonesInputFileName, cfg.pedoclimaticzonesOutputFileName);
