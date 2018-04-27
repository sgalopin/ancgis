describe('sig tests', function () {
  let page;

  before (async function () {
    page = await browser.newPage();
    // set the viewport so we know the dimensions of the screen
    await page.setViewport({ width: 1280, height: 1024 })
    await page.goto('http://localhost');
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  });

  after (async function () {
    await page.close();
  })

  it('should have the correct page title', async function () {
    expect(await page.title()).to.eql('Anc');
  });

  it('should have a single map', async function () {
    const BODY_SELECTOR = '.ol-viewport canvas';

    await page.waitFor(BODY_SELECTOR);

    expect(await page.$$(BODY_SELECTOR)).to.have.lengthOf(1);
  });

  it('should active the hive interaction', async function () {
    const oldInteractionsCount = await page.evaluate(() => {
      return anc.map.getInteractions().getArray().length;
    });

    // click on the add hive button
    await page.click('#anc-mapcontrol-addhive');

    const newInteractionsCount = await page.evaluate(() => {
      return anc.map.getInteractions().getArray().length;
    });

    expect(newInteractionsCount).to.eql(oldInteractionsCount + 1);
  });

  it('should had a single hive', async function () {
    const oldHivesCount = await page.evaluate(() => {
      var hivesLayer = anc.map.getLayerByName("hivesLayer"); // TODO: get the layer name or directly the layer
      return hivesLayer.getSource().getFeatures().length;
    });

    // click on the map to add a single hive
    await page.mouse.click(500, 500);
    // await page.click('canvas');

    const newHivesCount = await page.evaluate(() => {
      var hivesLayer = anc.map.getLayerByName("hivesLayer"); // TODO: get the layer name or directly the layer
      return hivesLayer.getSource().getFeatures().length;
    });

    expect(newHivesCount).to.eql(oldHivesCount + 1);
  });

});