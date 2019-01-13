/*global browser ancgis ol*/
/* eslint-disable no-console */

describe("Register tests:", function () {
  let page;
  // set the viewport so we know the dimensions of the screen
  const viewportSize = { width: 1280, height: 1024 };

  async function submitTestUser () {
    await page.goto("https://localhost/logout");
    await page.goto("https://localhost/register");
    await page.waitForSelector("#register-form");
    await page.type('#username', "ancgistest")
    await page.type('#email', "ancgis.test@gmail.com")
    await page.select('#profil', "Apiculteur")
    await page.type('#password', "ancgis-test-password")
    await page.click('button[type="submit"]')
  };

  before (async function () {
    this.timeout(100000);
    page = await browser.newPage();
    await page.setViewport(viewportSize);
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
  });

  after (async function () {
    await page.close();
  });

  it("Should register a valid test user", async function () {
    this.timeout(10000);
    submitTestUser();
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
    this.timeout(10000);
    submitTestUser();
    // Expect the register page reloading
    await page.waitForSelector(".alert", {timeout: 5000});
    // Get the errorMessage returned by the server
    const errorMessage = await page.evaluate(function(){
      $(".alert").children().remove();
      return $.trim($(".alert").text());
    });
    expect(errorMessage).to.equal('Un utilisateur avec le même nom est déjà enregistré.');
  });

});
