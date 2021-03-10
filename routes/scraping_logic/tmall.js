const Apify = require('apify');
let cookieList = require('./../scraping_auth/cookies.js') // for setting cookies if need be

module.exports = {
  // url to scrape
  requestUrl: 'https://detail.tmall.com/item.htm?spm=a220m.1000858.1000725.4.572e3d62RvjkIH&id=627592639476&skuId=4622978219576&user_id=2209148134363&cat_id=2&is_b=1&rn=22247bc4463c0d57c9953a221f967d49&on_comment=1',
  // launch options for scraper
  launchOptions: {
    // For example, by adding "slowMo" you'll slow down Puppeteer operations to simplify debugging
    slowMo: 10,
    useChrome: true,
    stealth: true,
    headless: false
  },
  // timeout configs for scraper
  timeouts: {
    handlePageTimeoutSecs: 100000,
    handleRequestTimeoutSecs: 100000,
    gotoTimeoutSecs: 100000,
  },
  //scraping logic
  handlePageFunction: async ({ request, page }) => {
    console.log(`Processing ${request.url}...`);
    const title = await page.title();
    console.log(`Title of ${request.url}: ${title}`);

    // console.log("========PAGE SETTING COOKIES==========")
    // await page.setCookie(...cookieList)
    // const cookiesSet = await page.cookies(request.url);
    // console.log(JSON.stringify(cookiesSet));

    // CLICK OUT OF THE LOGIN POPUP
    const closeButtonSelector = '.sufei-dialog-close';
    console.log("=====WAITING FOR CLOSE BUTTON TO POPUP=======")
    page.waitFor(closeButtonSelector)
    console.log("CLICKING THE CLOSE BUTTON");
    await page.click(closeButtonSelector);
    // let frame = await page.frames()
    // console.log("FRAME=========", frame)
    // CLICK OUT OF THE LOGIN POPUP pt. 2 (SOMETIMES THIS POPS UP)
    // const closeButtonSelector2 = '.baxia-dialog-close';
    // console.log("=====WAITING FOR CLOSE BUTTON TO POPUP=======")
    // page.waitFor(closeButtonSelector2)
    // console.log("CLICKING THE CLOSE BUTTON");
    // await page.click(closeButtonSelector2);
    // console.log("ENTERING PAGINATION LOOP======");
    /*
    ===== PAGINATION LOOP =======
    */
    let timeout; // undefined
    const buttonSelector = '.rate-paginator a:last-child';
    while (true) {
      /*
      ===== STEP 1: SCRAPE THE GIVEN PAGE OF COMMENTS =======
      */
      console.log('Scraping page #i');
      //wait for the rate-full-txt class to pop up before scraping
      await page.waitForSelector('.tm-rate-fulltxt');

      // A function to be evaluated by Puppeteer within the browser context.
      const data = await page.$$eval('tr', $posts => {
        const scrapedData = [];

        // We're getting the title, rank and URL of each post on Hacker News.
        $posts.forEach($post => {
          scrapedData.push({
            title: document.querySelector('title').innerText,
            comment: $post.querySelector('.tm-rate-fulltxt').innerText,
            date: $post.querySelector('.tm-rate-date').innerText,
            platform: 'Tmall'
            // href: $post.querySelector('.title a').href,
          });
        });

        return scrapedData;
      });
      // Store the results to the default dataset.
      await Apify.pushData(data);
      try {
        /*
        ===== STEP 2: CLICK TO THE NEXT PAGE OF COMMENTS =======
        */
        // Default timeout first time.
        console.log("=====WAITING FOR NEXT PAGE BUTTON SELECTOR========")
        /*
        ====== WAIT FOR FIVE SECONDS AND MAYBE DO SOME HUMAN SHIT IN BETWEEN ======
        */
        await Apify.utils.sleep(1000); // wait two seconds before each click of next page
        await page.waitForSelector(buttonSelector, { timeout });
        // 10 sec timeout after the first.
        timeout = 10000000;
      } catch (err) {
        // Ignore the timeout error.
        console.log('Could not find the "Show more button", '
        + 'we\'ve reached the end.');
        break;
      }
      console.log('Clicking the "Next page" button.');
      await page.click(buttonSelector);
    }
  }
}
