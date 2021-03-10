const Apify = require('apify');

module.exports = {
  // url to scrape
  requestUrl: 'https://npcitem.jd.hk/2362428.html#comment',
  // launch options for scraper
  launchContext:{
      // Apify helpers
      useChrome: true,
      stealth: true,
      // proxyUrl: 'http://user:password@some.proxy.com'
      // Native Puppeteer options
      launchOptions: {
          headless: true,
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
    await page.setRequestInterception(true);
    // block all images to speed up page loading process
    page.on('request', (req) => {
      if(req.resourceType() === 'image'){
        req.abort();
      }
      else {
        req.continue();
      }
    });

    const dataset = await Apify.openDataset('scrape_results');
    console.log(`Processing ${request.url}...`);
    const title = await page.title();
    // ===== Click the 好评价 button ========
    // console.log("WAITING TO CLICK GOOD REVIEWS BUTTON");
    // const good_review_btn = '.m-tab-trigger li:nth-child(2) a'
    // page.waitFor(good_review_btn)
    // await page.click(good_review_btn);
    /*
    ===== PAGINATION LOOP =======
    */
    let timeout; // declare timeout variable to be defined later
    const buttonSelector = '.ui-pager-next';
    let i = 1; // index so we can keep track of what page of the comments we are currently on
    while (true) {
      /*
      ===== STEP 1: SCRAPE THE GIVEN PAGE OF COMMENTS =======
      */
      console.log('Scraping page #: ', i);
      //wait for the rate-full-txt class to pop up before scraping
      await page.waitForSelector('.comments-item');

      // A function to be evaluated by Puppeteer within the browser context.
      const data = await page.$$eval('.comments-item', $posts => {
        const scrapedData = [];

        // We're getting the title, rank and URL of each post on Hacker News.
        $posts.forEach($post => {
          scrapedData.push({
            title: document.querySelector('title').innerText,
            comment: $post.querySelector('.p-comment').innerText,
            date: $post.querySelector('.time').innerText,
            platform: 'JD.com',
            // rating: document.querySelector('.percent-con')[0]
            // href: $post.querySelector('.title a').href,
          });
        });
        console.log("GOT COMMENTS")
        return scrapedData;
      });
      // Store the results to the default dataset.
      await dataset.pushData(data)
      await Apify.utils.sleep(1000);
      try {
        /*
        ===== STEP 2: CLICK TO THE NEXT PAGE OF COMMENTS =======
        */
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
  }
}
