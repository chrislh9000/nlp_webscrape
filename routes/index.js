var express = require('express');
var path = require("path");
var router = express.Router();
const fs = require('fs')
// let path = './../python/'
let {PythonShell} = require('python-shell');
const Apify = require('apify');
// const randomUA = require('modern-random-ua');
let cookieList = require('./scraping_auth/cookies.js') // for setting cookies if need be
let login_function = require('./scraping_auth/login.js') // for logging in if need be
let jd_global_scrape = require('./scraping_logic/jd_global.js') //jd_global handlePageFunction
let tmall_scrape = require('./scraping_logic/tmall.js')
let jd_scrape = require('./scraping_logic/jd.js')



/* GET home page. */
// router.get('/', (req, response, next) => {
//   let python_output = "";
//   PythonShell.run('index.py', options, function (err, res) {
//     if (err) throw err;
//     console.log('finished');
//     console.log(typeof(res[0]))
//     python_output = res.toString()
//     console.log(python_output)
//     response.render('index', { title: python_output });
//   });
// });

router.get('/', (req, response, next) => {
  response.render('homepage', { title: "NLP Webapp" });
});


/* merge datasets page. */
router.get('/merge_datasets', (req, response, next) => {
  response.render('datasets', { title: 'merge_datasets' });
})

/* download sentiment csv page. */
router.get('/sentiment_score', (req, response, next) => {
  response.render('sentiment', { title: 'sentiment_score' });
})

router.post('/sentiment_score', (req, response, next) => {
  let file;
  let uploadPath;
  // check to make sure the file thing isn't empty
  if (!req.files || Object.keys(req.files).length === 0) {
    return response.status(400).send('No files were uploaded.');
  }
  // upload the file somewhere on the server
  dataset = req.files.input_dataset;
  console.log(__dirname + '/../tempdata' + dataset.name)
  uploadPath = __dirname + '/../tempdata/' + dataset.name;
  // upload the data to the temp data folder
  dataset.mv(uploadPath, (err) => {
    if (err)
    return response.status(500).send(err);
    // run the python script with the temp file
    if (!req.body.segment_keywords) {
      console.log("YOOOO===", req.body.segment_keywords)
      console.log(typeof(req.body.segment_keywords))
      let keywords_input = 'null'
    } else if (req.body.segment_keywords) {
      console.log("YOOOO===", req.body.segment_keywords)
      console.log(typeof(req.body.segment_keywords))
      let keywords_input = req.body.segment_keywords
    }

    let options = {
      mode: 'text',
      pythonPath: '/Users/chemm/.pyenv/versions/3.7.3/bin/python3.7',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: `${__dirname}/../python`, //If you are having python_test.py script in same folder, then it's optional.
      args: ['sentiment', uploadPath, req.body.scoring_type, req.body.segment_keywords, req.body.segment_names] //An argument which can be accessed in the script using sys.argv[1]
    };

    PythonShell.run('index.py', options, function (err, res) {
      if (err) throw err;
      console.log('finished');
      let python_output;
      if (req.body.scoring_type == "overall") {
        python_output = res[1].toString()
        console.log("======PYTHON OUTPUT=======")
        console.log(python_output)
        python_output = [python_output]
      }
      if (req.body.scoring_type == "product") {
        python_output = res.slice(1, res.length)
      }
      if (req.body.scoring_type == "category") {
        python_output = res.slice(1, res.length)
      }
      console.log(python_output)
      // delete the file from tempdata
      try {
        fs.unlinkSync(uploadPath)
        //file removed
      } catch(err) {
        console.error(err)
      }
      const file = `${__dirname}/../df_download.csv`;
      let download_file_name = 'sentiment_data.csv';
      if (req.body.dataset_name) {
          download_file_name = req.body.dataset_name + '.csv'
      }
      response.download(file, download_file_name); // Set disposition and send it.
    });
  });
})



/* merge datasets page. */
router.get('/nps_output', (req, response, next) => {
  response.render('nps', { title: 'nps_output' });
})

router.post('/nps_output', (req, response, next) => {
  console.log("CHANGES WORK=====")
  let file;
  let uploadPath;
  // check to make sure the file thing isn't empty
  if (!req.files || Object.keys(req.files).length === 0) {
    return response.status(400).send('No files were uploaded.');
  }
  // upload the file somewhere on the server
  dataset = req.files.input_dataset;
  console.log(__dirname + '/../tempdata/' + dataset.name)
  uploadPath = __dirname + '/../tempdata/' + dataset.name;
  // upload the data to the temp data folder
  dataset.mv(uploadPath, (err) => {
    if (err)
    return response.status(500).send(err);
    // run the python script with the temp file
    let options = {
      mode: 'text',
      pythonPath: '/Users/chemm/.pyenv/versions/3.7.3/bin/python3.7',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: `${__dirname}/../python`, //If you are having python_test.py script in same folder, then it's optional.
      args: ['nlp', uploadPath, req.body.scoring_type, req.body.category_keywords, req.body.segment_names] //An argument which can be accessed in the script using sys.argv[1]
    };

    PythonShell.run('index.py', options, function (err, res) {
      if (err) throw err;
      console.log('finished');
      let python_output;
      if (req.body.scoring_type == "overall") {
        python_output = res[1].toString()
        python_output = [python_output]
      }
      if (req.body.scoring_type == "product") {
        python_output = res.slice(1, res.length)
      }
      if (req.body.scoring_type == "category") {
        python_output = res.slice(1, res.length)
      }
      console.log(python_output)
      // delete the file from tempdata
      try {
        fs.unlinkSync(uploadPath)
        //file removed
      } catch(err) {
        console.error(err)
      }
      response.render('nps_output', {
        filename: dataset.name,
        nps: python_output,
        method: req.body.scoring_type
      });
    });
  });
})

/* merge datasets page. */
router.get('/training', (req, response, next) => {
  response.render('train', { title: 'training' });
})


router.get('/comment_view', (req, response, next) => {
  response.render('comment_view', { title: 'comment view' });
})

router.post('/comment_view', (req, response, next) => {
  let file;
  let uploadPath;
  // check to make sure the file thing isn't empty
  if (!req.files || Object.keys(req.files).length === 0) {
    return response.status(400).send('No files were uploaded.');
  }
  // upload the file somewhere on the server
  dataset = req.files.input_dataset;
  console.log(__dirname + '/../tempdata' + dataset.name)
  uploadPath = __dirname + '/../tempdata/' + dataset.name;
  // upload the data to the temp data folder
  dataset.mv(uploadPath, (err) => {
    if (err)
    return response.status(500).send(err);
    // run the python script with the temp file
    let options = {
      mode: 'text',
      pythonPath: '/Users/chemm/.pyenv/versions/3.7.3/bin/python3.7',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: `${__dirname}/../python`, //If you are having python_test.py script in same folder, then it's optional.
      args: ['print_comments', uploadPath, req.body.ranking_type] //An argument which can be accessed in the script using sys.argv[1]
    };

    PythonShell.run('index.py', options, function (err, res) {
      if (err) throw err;
      console.log('finished');
      let python_output;
      python_output = res.slice(1, res.length)
      console.log(python_output)
      // delete the file from tempdata
      try {
        fs.unlinkSync(uploadPath)
        //file removed
      } catch(err) {
        console.error(err)
      }
      response.render('comment_view_output', {
        filename: dataset.name,
        comments: python_output,
        method: req.body.ranking_type
      });
    });
  });
})

/* merge datasets page. */
router.get('/webscraping', (req, response, next) => {
  response.render('webscraping', { title: 'training' });
})

router.post('/webscraping', (req, response, next) => {
  async function pop_urls() {
    let url_arr = req.body.scraping_url.split(',')
    let source_arr = []
    for (let i = 0; i < url_arr.length - 1; i++) {
      // trim whitespace
      url = url_arr[i].trim()
      // create obj
      temp_obj = { url: url }
      source_arr.push(temp_obj)
    }
    console.log("SOURCE ARR=====", source_arr)
    return source_arr
  }
  // scrape_results = await scrape_function()
  async function scrape_page() {
    // check what site we are scrape and set the function to be exactly that
    let scrape_opt; // the scraping logic to be used
    if (req.body.platform_name == 'JD.com') {
      scrape_opt = jd_scrape;
    } else if (req.body.platform_name == 'JD.com Global') {
      scrape_opt = jd_global_scrape;
    }
    // popuate requestList url array
    request_urls = await pop_urls()
    console.log("REQUEST URLS ", request_urls)
    // We add our first request to the queue, which is the initial page the crawler will visit.
    const requestList = new Apify.RequestList({
      sources: [
        // Separate requests
        { url: req.body.scraping_url},
        // { url: 'http://www.example.com/page-2'},
      ],
      // Persist the state to avoid re-crawling which can lead to data duplications.
      // Keep in mind that the sources have to be immutable or this will throw an error.
      // persistStateKey: 'my-state',
    });

    await requestList.initialize();
    // === initialize dataset
    const dataset = await Apify.openDataset('scrape_results');
    // Create an instance of the PuppeteerCrawler class - a headless browser crawler
    const crawler = new Apify.PuppeteerCrawler({
      requestList,
      // Here you can set options that are passed to the Apify.launchPuppeteer() function.
      launchContext: scrape_opt.launchContext,
      // ======== crawling specs ===========
      maxRequestsPerCrawl: 20,
      maxRequestRetries: 2,
      handlePageTimeoutSecs: scrape_opt.timeouts.handlePageTimeoutSecs,
      handleRequestTimeoutSecs: scrape_opt.timeouts.handleRequestTimeoutSecs,
      gotoTimeoutSecs: scrape_opt.timeouts.gotoTimeoutSecs,
      // ======= scraping logic
      handlePageFunction: async ({ request, page }) => {
        await scrape_opt.handlePageFunction({request, page})
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
    console.log('crawler finished')
    // create on json file with all the comments in each of them
    const mega_json = {
      "data": []
    };
    await dataset.forEach(async (item, index) => {
      mega_json['data'] = mega_json['data'].concat(JSON.stringify(item))
    });
    // console.log(mega_json)
    console.log("DOWNLOADING JSON FILE")
    uploadPath = __dirname + '/../tempdata/webscrape_results.json';
    fs.writeFileSync(uploadPath, JSON.stringify(mega_json));
    await dataset.drop()
    // merge the json files into csv files and run the python scriptPath
    let options = {
      mode: 'text',
      pythonPath: '/Users/chemm/.pyenv/versions/3.7.3/bin/python3.7',
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: `${__dirname}/../python`, //If you are having python_test.py script in same folder, then it's optional.
      args: ['webscrape_download', uploadPath, req.body.product_name] //An argument which can be accessed in the script using sys.argv[1...n]
    };

    PythonShell.run('index.py', options, function (err, res) {
      if (err) throw err;
      console.log('finished');
      let python_output;
      python_output = res.slice(1, res.length)
      console.log(python_output)
      // download resultant csv file to local machine
      const file = `${__dirname}/../webscraped_download.csv`;
      let download_file_name = 'webscraped_data.csv';
      if (req.body.dataset_name) {
          download_file_name = req.body.dataset_name + '.csv'
      }
      response.download(file, download_file_name); // Set disposition and send it.
      // clear dataset entries
      // render success page
      // response.render('webscraping_success', {
      // });
    });
  }
  scrape_page();
})

module.exports = router;
