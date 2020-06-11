/*global browser ancgis ol*/
/* eslint-disable no-console */
const { registerTestUser, loginTestUser, expectMessage, logPageConsoleMessages } = require("../macros.js");

describe("REQUIRE PASSWORD RESET TESTS:", function () {
  let page;
  // set the viewport so we know the dimensions of the screen
  const viewportSize = { width: 1280, height: 1024 };

  before (async function () {
    this.timeout(5000);
    page = await browser.newPage();
    logPageConsoleMessages(page);
    await page.setViewport(viewportSize);
    await registerTestUser(page); // Makes login too.
    await page.goto("https://localhost/logout"); // Logout to access to the requirePwdReset page
  });

  after (async function () {
    await loginTestUser(page); // Must be loged to unregister
    await page.goto("https://localhost/unregister"); // Makes logout too.
    await page.close();
  });

  it("should have a correct heading", async function () {
    await page.goto("https://localhost/requirePwdReset");
    await page.waitFor("h1");
    const heading = await page.$eval("h1", heading => heading.innerText);
    expect(heading).to.eql("Demande de modification de mot de passe");
  });

  it("should have a require password reset form", async function () {
    const FORM_SELECTOR = "#requirepwdreset-form";
    await page.waitFor(FORM_SELECTOR, {timeout: 2000});
    expect(await page.$$(FORM_SELECTOR)).to.have.lengthOf(1);
  });

  it("should require a password reset for a valid email", async function () {
    await page.type('#email', "ancgis.test@gmail.com");
    await page.click('button[type="submit"]');
    await expectMessage(page, "Un email a été envoyé à ancgis.test@gmail.com avec un lien de réinitialisation.");
  });

  it("shouldn't require a password reset for a invalid email", async function () {
    await page.goto("https://localhost/requirePwdReset");
    await page.type('#email', "xxx@xxx.xx");
    await page.click('button[type="submit"]');
    await expectMessage(page, "Aucun compte n'existe avec cette adresse e-mail.");
  });
});
