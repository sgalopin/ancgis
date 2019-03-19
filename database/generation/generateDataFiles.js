// Imports
const fs = require('fs');
const generateAntennasFct = require('./generateAntennasFile');
const generateAntennaSectorsFct = require('./generateAntennaSectorsFile');
const generateHighVoltageLinesFct = require('./generateHighVoltageLinesFile');
const generateHighVoltageLineSectorsFct = require('./generateHighVoltageLineSectorsFile');
const generateWaterAreasFct = require('./generateWaterAreasFile');

// Files parameters
var cfg = JSON.parse(fs.readFileSync("config.json"));

// Generates the js data files
// Antennas
const antennasCleanedInputFileName = cfg.antennasInputFileName.replace('.geojson','_cleaned.geojson');
generateAntennasFct(cfg.antennasInputFileName, antennasCleanedInputFileName);
generateAntennaSectorsFct(antennasCleanedInputFileName, cfg.antennaSectorsOutputFileName);
// High Voltage Lines
const hvlCleanedInputFileName = cfg.highVoltageLinesInputFileName.replace('.geojson','_cleaned.geojson');
generateHighVoltageLinesFct(cfg.highVoltageLinesInputFileName, hvlCleanedInputFileName);
generateHighVoltageLineSectorsFct(hvlCleanedInputFileName, cfg.highVoltageLineSectorsOutputFileName);
// Water Areas
generateWaterAreasFct(cfg.waterAreasInputFileName, cfg.waterAreasOutputFileName);
