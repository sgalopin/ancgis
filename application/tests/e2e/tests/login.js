/*global browser ancgis ol*/
/* eslint-disable no-console */
const { registerTestUser, loginTestUser, logPageConsoleMessages } = require("../macros.js");

describe("LOGIN TESTS:", function () {
  let page;
  // set the viewport so we know the dimensions of the screen
  const viewportSize = { width: 1280, height: 1024 };

  before (async function () {
    this.timeout(6000);
    page = await browser.newPage();
    logPageConsoleMessages(page);
    await page.setViewport(viewportSize);
    await registerTestUser(page); // Makes login too.
  });

  after (async function () {
    await page.goto("https://localhost/unregister"); // Makes logout too.
    await page.close();
  });

  it("should logout", async function () { // Login done via the registration
    await page.goto("https://localhost/logout");
    response = await page.evaluate(() =>  {
       return JSON.parse(document.querySelector("body").innerText);
    });
    expect(response.success).to.be.true;
  });

  it("should have the correct page title", async function () {
    await page.goto("https://localhost");
    expect(await page.title()).to.eql("AncSIG™");
  });

  it("should have a login form", async function () {
    const LOGIN_FORM_SELECTOR = "#login-form";
    await page.waitFor(LOGIN_FORM_SELECTOR, {timeout: 2000});
    expect(await page.$$(LOGIN_FORM_SELECTOR)).to.have.lengthOf(1);
  });

  it("should authenticate a valid login", async function () {
    this.timeout(4000);
    await loginTestUser(page);
    const ancgisIsDefined = await page.evaluate(() => typeof ancgis !== 'undefined');
    expect(ancgisIsDefined).to.be.true;
  });
});
