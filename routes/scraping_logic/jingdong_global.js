const Apify = require('apify');



Apify.main(async () => {
  // //LOGIN LOGIC
  // const browser = await Apify.launchPuppeteer({useChrome: true, stealth: true, headless:false});
  // const log_page = await browser.newPage();
  // await log_page.goto('https://login.taobao.com/', {waituntil: "networkidle0"});
  // // Login
  // // const frame = await log_page.frames().find(frame => frame.url() === 'login.jhtml');
  // // if(!frame){
  // //   console.log("iFrame not found with the specified url");
  // //   process.exit(0);
  // // }
  // // console.log("Frame found");
  // // await frame.click('.input-wrap-loginid input')
  // // console.log("USERNAME PLACEHOLDER======", document.querySelector('.input-wrap-loginid input').placeholder)
  // // const login = await frame.waitForSelector('div.input-wrap-loginid input');
  // // await login.click();
  // await log_page.click('.input-wrap-loginid input')
  // await log_page.keyboard.sendCharacter('19921364889');
  // await log_page.click('.input-wrap-password input')
  // await log_page.keyboard.sendCharacter('!y24vw9zJ');
  // // log_page.waitForSelector('.fm_submit')
  // // await log_page.type('.input-wrap-loginid input', '19921364889');
  // // await log_page.type('.input-wrap-password input', '!y24vw9zJ');
  // await log_page.click('.password-login');
  // const frames = await log_page.frames()
  // console.log("===FRAMES=====", frames)
  // await log_page.waitForNavigation();
  // Apify.openRequestQueue() is a factory to get a preconfigured RequestQueue instance.
  // We add our first request to it - the initial page the crawler will visit.
  const requestQueue = await Apify.openRequestQueue();
  await requestQueue.addRequest({ url: 'https://npcitem.jd.hk/100007857029.html#comment'});


  // Create an instance of the PuppeteerCrawler class - a crawler
  // that automatically loads the URLs in headless Chrome / Puppeteer.
  const crawler = new Apify.PuppeteerCrawler({
    requestQueue,

    // Here you can set options that are passed to the Apify.launchPuppeteer() function.
    launchPuppeteerOptions: {
      // For example, by adding "slowMo" you'll slow down Puppeteer operations to simplify debugging
      slowMo: 100,
      useChrome: true,
      stealth: true,
      headless: false
    },

    // Stop crawling after several pages
    maxRequestsPerCrawl: 20,

    // maximum number of retries if request fails
    maxRequestRetries: 2,

    //timeout function:
    handlePageTimeoutSecs: 10000,

    // navigationTimeoutSecs: 10000,

    //takes a long time to load the page
    handleRequestTimeoutSecs: 10000,

    gotoTimeoutSecs: 10000,

    //takes a long time to load the page
    // navigationTimeoutSecs: 10000,


    // This function will be called for each URL to crawl.
    // Here you can write the Puppeteer scripts you are familiar with,
    // with the exception that browsers and pages are automatically managed by the Apify SDK.
    // The function accepts a single parameter, which is an object with the following fields:
    // - request: an instance of the Request class with information such as URL and HTTP method
    // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)
    handlePageFunction: async ({ request, page }) => {

      /*
      Block images to speed up crawl speed
      */

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

      // Click the 好评价 button
      // console.log("WAITING TO CLICK GOOD REVIEWS BUTTON");
      // const good_review_btn = '.m-tab-trigger li:nth-child(2) a'
      // page.waitFor(good_review_btn)
      // await page.click(good_review_btn);
      /*
      ===== PAGINATION LOOP =======
      */
      let timeout; // undefined
      const buttonSelector = '.ui-pager-next';
      let i = 1;
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

          return scrapedData;
        });
        // Store the results to the default dataset.
        await Apify.pushData(data);

        await Apify.utils.sleep(2000);
        try {
          /*
          ===== STEP 2: CLICK TO THE NEXT PAGE OF COMMENTS =======
          */
          // Default timeout first time.
          // console.log("=====WAITING FOR NEXT PAGE BUTTON SELECTOR========")
          // await page.waitForSelector(buttonSelector, { timeout });
          // 10 sec timeout after the first.
          // timeout = 10000000;
        } catch (err) {
          // Ignore the timeout error.
          console.log('Could not find the "Show more button", '
          + 'we\'ve reached the end.');
          break;
        }
        console.log("=====WAITING FOR NEXT PAGE BUTTON SELECTOR pt. 2========")
        await page.waitForSelector(buttonSelector, { timeout });
        timeout = 10000000;
        console.log('Clicking the "Next page" button to page');
        await page.click(buttonSelector);
        i += 1;
      }

      // Find a link to the next page and enqueue it if it exists.
      // const infos = await Apify.utils.enqueueLinks({
      //     page,
      //     requestQueue,
      //     selector: '.morelink',
      // });

      // if (infos.length === 0) console.log(`${request.url} is the last page!`);
    },

    // This function is called if the page processing failed more than maxRequestRetries+1 times.
    handleFailedRequestFunction: async ({ request }) => {
      console.log(`Request ${request.url} failed too many times`);
      await Apify.pushData({
        '#debug': Apify.utils.createRequestDebugInfo(request),
      });
    },
  });

  // Run the crawler and wait for it to finish.
  await crawler.run();

  console.log('Crawler finished.');
});
