waitUntilAncgisOrError = async function(page) {
  const alertSelector = ".alert-danger, .alert-warning";
  await Promise.race([
    page.waitForFunction("typeof ancgis !== 'undefined'", { timeout: 4000 }),
    page.waitForSelector(alertSelector)
  ]);
  if (await page.$(alertSelector)) {
    // Get the errorMessage returned by the server
    const errorMessage = await page.evaluate(function(){
      $(".alert").children().remove();
      return $.trim($(".alert").text());
    });
    console.log("Printed error: ", errorMessage);
  }
}

exports.registerTestUser  = async function(page) {
  console.log('Start of registerTestUser');
  try {
    await page.goto("https://localhost/logout");
    await page.goto("https://localhost/register", { waitUntil:"load" });
    await page.type('#username', "ancgistest");
    await page.type('#email', "ancgis.test@gmail.com");
    await page.select('#profil', "Apiculteur");
    await page.type('#password', "ancgis-test-password");
    const [response] = await Promise.all([
      page.waitForNavigation({ timeout: 6000 }),
      page.click('button[type="submit"]')
    ]);
    if (response._status == 200) {
      await waitUntilAncgisOrError(page);
    } else {
      console.log("Register response status: ", response._status);
    }
  } catch(e) {
    console.log(e);
  }
  console.log('End of registerTestUser');
};

exports.loginTestUser = async function(page) {
  console.log('Start of loginTestUser');
  try {
    await page.goto("https://localhost/logout");
    await page.goto("https://localhost", { waitUntil:"load" });
    await page.type('#login-form [name="username"]', "ancgistest");
    await page.type('#login-form [name="password"]', "ancgis-test-password");
    await page.click('#login-form button[type="submit"]');
    await waitUntilAncgisOrError(page);
  } catch(e) {
    console.log(e);
  }
  console.log('End of loginTestUser');
};

exports.sleep = function(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

exports.expectMessage = async function(page, expectedMessage) {
  try {
    // Expect the register page reloading
    await page.waitForSelector(".alert", {timeout: 5000});
    // Get the errorMessage returned by the server
    const errorMessage = await page.evaluate(function(){
      $(".alert").children().remove();
      return $.trim($(".alert").text());
    });
    expect(errorMessage).to.equal(expectedMessage);
  } catch(e) {
    console.log(e);
  }
}
