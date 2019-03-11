const router = require("express").Router();  // eslint-disable-line new-cap
const foragingAreaService = require("../../services/foragingArea.js");

// Return the foraging area
router.get("/:x/:y", async function(req, res) {
  const coordinates = [parseFloat(req.params.x),parseFloat(req.params.y)];
  res.json({ success: true, geometry: await foragingAreaService(coordinates) });
});

module.exports = router;
