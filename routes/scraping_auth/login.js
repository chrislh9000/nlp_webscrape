/*
Specify a website and your login information and login to the said website
*/
const Apify = require('apify');

module.exports = async (website, login_info) => {
  if (website == 'taobao') {
    //LOGIN LOGIC
    const browser = await Apify.launchPuppeteer({useChrome: true, stealth: true, headless:false});
    const log_page = await browser.newPage();
    await log_page.goto('https://login.taobao.com/', {waituntil: "networkidle0"});
    // Login
    await log_page.click('.input-wrap-loginid input')
    await log_page.keyboard.sendCharacter(login_info.username);
    await log_page.click('.input-wrap-password input')
    await log_page.keyboard.sendCharacter(login_info.password);
    // log_page.waitForSelector('.fm_submit')
    // await log_page.type('.input-wrap-loginid input', '19921364889');
    // await log_page.type('.input-wrap-password input', '!y24vw9zJ');
    await log_page.click('.password-login');
  }
}
