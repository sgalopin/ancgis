/*global browser ancgis ol*/
/* eslint-disable no-console */

describe("sig tests", function () {
  let page;
  const viewportSize = { width: 1280, height: 1024 };

  before (async function () {

    this.timeout(100000);

    page = await browser.newPage();
    // set the viewport so we know the dimensions of the screen

    await page.setViewport(viewportSize);
    await page.goto("https://localhost");
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  });

  after (async function () {
    await page.close();
  });

  it("should have the correct page title", async function () {
    expect(await page.title()).to.eql("AncSIG™");
  });

  it("should have a login form", async function () {
    const LOGIN_FORM_SELECTOR = "#login-form";
    await page.waitFor(LOGIN_FORM_SELECTOR, {timeout: 2000});
    expect(await page.$$(LOGIN_FORM_SELECTOR)).to.have.lengthOf(1);
  });

  it("should authenticate a valid login", async function () {
    await page.type('#login-form [name="username"]', "ancgistest")
    await page.type('#login-form [name="password"]', "ancgis-test-password")
    await page.click('#login-form button[type="submit"]')
    const MAP_SELECTOR = ".ol-viewport canvas";
    await page.waitFor(MAP_SELECTOR, {timeout: 2000});
    expect(await page.$$(MAP_SELECTOR)).to.have.lengthOf(1);
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

    this.timeout(50000);

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
