// Imports
const fs = require('fs');
const generateAntennasFct = require('./generateAntennasFile');
const generateAntennaSectorsFct = require('./generateAntennaSectorsFile');

// Files parameters
var cfg = JSON.parse(fs.readFileSync("config.json"));
const cleanedInputFileName = cfg.inputFileName.replace('.geojson','_cleaned.geojson');

// Generates the js data files
generateAntennasFct(cfg.inputFileName, cleanedInputFileName, cfg.outputAntennasFileName);
generateAntennaSectorsFct(cleanedInputFileName, cfg.outputAntennaSectorsFileName);
