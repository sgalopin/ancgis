/*global browser ancgis ol*/
/* eslint-disable no-console */
const { loginTestUser } = require("../macros.js");

describe("LOGIN TESTS:", function () {
  let page;
  // set the viewport so we know the dimensions of the screen
  const viewportSize = { width: 1280, height: 1024 };

  before (async function () {
    this.timeout(6000);
    page = await browser.newPage();
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.setViewport(viewportSize);
  });

  after (async function () {
    await page.close();
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
    this.timeout(3000);
    await loginTestUser(page);
    const MAP_SELECTOR = ".ol-viewport canvas";
    expect(await page.$$(MAP_SELECTOR)).to.have.lengthOf(1);
  });

  it("should logout", async function () {
    await page.goto("https://localhost/logout");
    response = await page.evaluate(() =>  {
       return JSON.parse(document.querySelector("body").innerText);
    });
    expect(response.success).to.be.true;
  });
});
