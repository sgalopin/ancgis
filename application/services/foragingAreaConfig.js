module.exports = {
  // targetRadius:
  // - Is the aera target radius
  // Pre-vernal (PV): 0.5, Vernal (V):2, Estival (E):3, Estivo-automnale (EA):1
  "targetRadius": 3, // Kilometers
  // lookupAreaRadius:
  // - Is the size of the lookup grid.
  // - Must be twice the target radius to respect the target air
  //   when the bees are stopped in one direction by a high-voltage line.
  // Increasing this parameter too much has a negative effect on performance.
  "lookupAreaRadius": 6, // Kilometers
  // lookupAreaCellSize:
  // - Is the size of a lookup grid cell.
  // Decreasing this parameter too much has a negative effect on performance.
  "lookupAreaCellSize": 0.1, // Kilometers
  // antennaWeightFactor:
  // - Is the weighting factor of the antenna.
  "antennaWeightFactor": 100,
  // hvlWeightFactor:
  // - Is the weighting factor of the high-voltage line.
  "hvlWeightFactor": 100,
  // waterWeightFactor:
  // - Is the weighting factor of the water aeras.
  "waterWeightFactor": 100
}
