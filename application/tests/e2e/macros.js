exports.registerTestUser  = async function(page) {
  await page.goto("https://localhost/logout");
  await page.goto("https://localhost/register");
  await page.waitForSelector("#register-form");
  await page.type('#username', "ancgistest")
  await page.type('#email', "ancgis.test@gmail.com")
  await page.select('#profil', "Apiculteur")
  await page.type('#password', "ancgis-test-password")
  await page.click('button[type="submit"]')
};

exports.loginTestUser = async function(page) {
  console.log('Start of loginTestUser');
  await page.goto("https://localhost/logout");
  await page.goto("https://localhost");
  await page.waitForSelector("#login-form");
  await page.type('#login-form [name="username"]', "ancgistest");
  await page.type('#login-form [name="password"]', "ancgis-test-password");
  await page.click('#login-form button[type="submit"]');
  await page.waitForFunction("typeof ancgis !== 'undefined'", { timeout: 2000 });
  console.log('End of loginTestUser');
};

exports.sleep = function(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
