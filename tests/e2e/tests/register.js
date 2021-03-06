/*global browser ancgis ol*/
/* eslint-disable no-console */
const { registerTestUser, loginTestUser, expectMessage, logPageConsoleMessages } = require("../macros.js");

describe("REGISTER TESTS:", function () {
  let page;
  // set the viewport so we know the dimensions of the screen
  const viewportSize = { width: 1280, height: 1024 };

  before (async function () {
    this.timeout(5000);
    page = await browser.newPage();
    logPageConsoleMessages(page);
    await page.setViewport(viewportSize);
  });

  after (async function () {
    await page.close();
  });

  it("Should register a valid test user", async function () {
    this.timeout(6000);
    await registerTestUser(page);
    try {
      // Expect the map loading
      await page.waitForSelector(".ol-viewport canvas", {timeout: 5000});
    } catch(e) {
      // Get the errorMessage returned by the server
      const errorMessage = await page.evaluate(function(){
        $(".alert").children().remove();
        return $.trim($(".alert").text());
      });
      expect.fail(errorMessage);
    }
  });

  it("Should refuse an existing user", async function () {
    this.timeout(6000);
    await registerTestUser(page);
    await expectMessage(page, "Un utilisateur avec le même nom est déjà enregistré.");
  });

  it("should unregister", async function () {
    this.timeout(3000);
    await loginTestUser(page); // Logout done via the previous registerTestUser function call
    await page.goto("https://localhost/unregister");
    response = await page.evaluate(() =>  {
       return JSON.parse(document.querySelector("body").innerText);
    });
    expect(response.success).to.be.true;
  });
});
