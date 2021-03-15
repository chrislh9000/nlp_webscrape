const Apify = require('apify');

module.exports = {
  // url to scrape
  requestUrl: 'https://item.jd.com/100017641792.html#comment',
  // launch options for scraper
  launchContext:{
      // Apify helpers
      useChrome: true,
      stealth: true,
      // proxyUrl: 'http://user:password@some.proxy.com'
      // Native Puppeteer options
      launchOptions: {
          headless: false,
          args: ['--some-flag'],
      }
  },
  // timeout configs for scraper
  timeouts: {
    handlePageTimeoutSecs: 100000,
    handleRequestTimeoutSecs: 100000,
    gotoTimeoutSecs: 100000,
  },
  //scraping logic
  handlePageFunction: async ({ request, page }) => {
    // ======= dataset initalization
    const dataset = await Apify.openDataset('scrape_results');
    // clear previous dataset entries
    // await dataset.drop()
    // ======= reinitialize scrape results folder
    // dataset = await Apify.openDataset('scrape_results');

    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if(req.resourceType() === 'image'){
        req.abort();
      }
      else {
        req.continue();
      }
    });
    console.log(`Processing ${request.url}...`);
    const title = await page.title();
    console.log(`Title of ${request.url}: ${title}`);

    // console.log("========PAGE SETTING COOKIES==========")
    // // await page.setCookie(...cookieList)
    // // const cookiesSet = await page.cookies(request.url);
    // // console.log(JSON.stringify(cookiesSet));

    // CLICK OUT OF THE LOGIN POPUP
    // const closeButtonSelector = '.sufei-dialog-close';
    // console.log("=====WAITING FOR CLOSE BUTTON TO POPUP=======")
    // page.waitFor(closeButtonSelector)
    // console.log("CLICKING THE CLOSE BUTTON");
    // await page.click(closeButtonSelector);
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
    const buttonSelector = '.ui-pager-next';
    let i = 1
    while (true) {
      /*
      ===== STEP 1: SCRAPE THE GIVEN PAGE OF COMMENTS =======
      */
      console.log('Scraping page #: ', i);
      //wait for the rate-full-txt class to pop up before scraping
      await page.waitForSelector('.comment-item');

      // A function to be evaluated by Puppeteer within the browser context.
      const data = await page.$$eval('.comment-item', $posts => {
        const scrapedData = [];

        // We're getting the title, rank and URL of each post on Hacker News.
        $posts.forEach($post => {
          scrapedData.push({
            title: document.querySelector('title').innerText,
            comment: $post.querySelector('.comment-con').innerText,
            date: $post.querySelector('.order-info').innerText,
            platform: 'JD.com',
            rating: document.querySelector('.percent-con')[0]
            // href: $post.querySelector('.title a').href,
          });
        });

        return scrapedData;
      });
      // Store the results to the default dataset.
      // await Apify.pushData(data);
      await dataset.pushData(data)
      await Apify.utils.sleep(1000);
      try {
        /*
        ===== STEP 2: CLICK TO THE NEXT PAGE OF COMMENTS =======
        */
        // Default timeout first time.
        console.log("=====WAITING FOR NEXT PAGE BUTTON SELECTOR pt. 2========")
        await page.waitForSelector(buttonSelector, { timeout });
        timeout = 5000;
        console.log('Clicking the "Next page" button to page');
        await page.click(buttonSelector);
        i+=1;
      } catch (err) {
        // Ignore the timeout error.
        console.log('Could not find the "Show more button", '
        + 'we\'ve reached the end.');
        break;
      }
      // console.log("=====WAITING FOR NEXT PAGE BUTTON SELECTOR pt. 2========")
      // await page.waitForSelector(buttonSelector, { timeout });
      // timeout = 10000000;
      // console.log('Clicking the "Next page" button to page');
      // await page.click(buttonSelector);
      // i += 1;
    }

    // Find a link to the next page and enqueue it if it exists.
    // const infos = await Apify.utils.enqueueLinks({
    //     page,
    //     requestQueue,
    //     selector: '.morelink',
    // });

    // if (infos.length === 0) console.log(`${request.url} is the last page!`);
  }
}
