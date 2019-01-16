/*global browser ancgis ol*/
/* eslint-disable no-console */
const { loginTestUser, sleep } = require("../macros.js");

describe("SIG TESTS:", function () {
  let page;
  // set the viewport so we know the dimensions of the screen
  const viewportSize = { width: 1280, height: 1024 };

  before (async function () {
    this.timeout(6000);
    page = await browser.newPage();
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.setViewport(viewportSize);
    await loginTestUser(page);
  });

  after (async function () {
    await page.close();
  });

  it("should active the hive interaction", async function () {
    const oldInteractionsCount = await page.evaluate(() => {
      return ancgis.map.getInteractions().getArray().length;
    });
    // click on the add hive button
    await page.click("#ancgis-mapcontrol-addhive");
    const newInteractionsCount = await page.evaluate(() => {
      return ancgis.map.getInteractions().getArray().length;
    });
    expect(newInteractionsCount).to.eql(oldInteractionsCount + 1);
  });

  it("should had a single hive", async function () {
    this.timeout(5000);
    const oldHivesCount = await page.evaluate(() => {
      var hivesLayer = ancgis.map.getLayerByName("hivesLayer"); // TODO: get the layer name or directly the layer
      return hivesLayer.getSource().getFeatures().length;
    });
    const newHivesCount = await page.evaluate((viewportSize) => {
      // click on the map to add a single hive
      ancgis.map.simulateEvent("singleclick", 0, 0, viewportSize);
      var hivesLayer = ancgis.map.getLayerByName("hivesLayer"); // TODO: get the layer name or directly the layer
      return hivesLayer.getSource().getFeatures().length;
    }, viewportSize);
    expect(newHivesCount).to.eql(oldHivesCount + 1);
  });
});
