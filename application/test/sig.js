/*global browser ancgis ol*/
describe("sig tests", function () {
  let page;

  before (async function () {

    this.timeout(100000);

    page = await browser.newPage();
    // set the viewport so we know the dimensions of the screen
    const viewportSize = { width: 1280, height: 1024 };
    await page.setViewport(viewportSize);
    await page.goto("http://localhost");
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    // Add few test functions to the page
    await page.evaluate( (viewportSize) => {
      ancgis.test = {};
      // See ol3/test/spec/ol/interaction/select.test.js
      /**
       * Simulates a browser event on the map viewport.  The client x/y location
       * will be adjusted as if the map were centered at 0,0.
       * @param {string} type Event type.
       * @param {number} x Horizontal offset from map center.
       * @param {number} y Vertical offset from map center.
       * @param {boolean=} optShiftKey Shift key is pressed.
       */
      ancgis.test.simulateEvent = function(type, x, y, optShiftKey) {
        var viewport = ancgis.map.getViewport();
        // calculated in case body has top < 0 (test runner with small window)
        var position = viewport.getBoundingClientRect();
        var shiftKey = (typeof optShiftKey !== "undefined") ? optShiftKey : false;
        var event = new ol.pointer.PointerEvent(type, {
          clientX: position.left + x + viewportSize.width / 2,
          clientY: position.top + y + viewportSize.height / 2,
          shiftKey
        });
        ancgis.map.handleMapBrowserEvent(new ol.MapBrowserPointerEvent(type, ancgis.map, event));
      };
      return;
    }, viewportSize);
  });

  after (async function () {
    await page.close();
  });

  it("should have the correct page title", async function () {
    expect(await page.title()).to.eql("AncSIG&trade;");
  });

  it("should have a single map", async function () {
    const BODY_SELECTOR = ".ol-viewport canvas";

    await page.waitFor(BODY_SELECTOR);

    expect(await page.$$(BODY_SELECTOR)).to.have.lengthOf(1);
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

    const newHivesCount = await page.evaluate(() => {
      // click on the map to add a single hive
      ancgis.test.simulateEvent("singleclick", 0, 0);
      var hivesLayer = ancgis.map.getLayerByName("hivesLayer"); // TODO: get the layer name or directly the layer
      return hivesLayer.getSource().getFeatures().length;
    });

    expect(newHivesCount).to.eql(oldHivesCount + 1);
  });

});