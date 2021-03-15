# nlp_webscrape
Webscraping and nlp web app for e-commerce sites

## 1) Introduction and motivation

Welcome to the Webscraping and NLP web application. Functionalities and structure of this app were developed with respect to and over the course of an engagement to assess
consumer attitudes towards a newly launched consumer products brand relative to its competitors.

With newly launched products, sales data may be limited and product positioning/development might be in relatively early stages.
It’s useful to understand initial product perception and how the product is competing relative to similar and competing products.

Product reviews on e-commerce sites like Amazon, Taobao, Tmall, and JD.com can be an insightful testing ground
that can inform product development, marketing and positioning initiatives.

With that being said, this ScrapingNLP web app aims to aggregate comments about certain products from different e-commerce platforms and then
perform NLP analysis on these comments to extract meaningful insights about how different aspects of the product are regarded by customers.


## 2) How it works

At a high level, the ScrapeNLP app allows you to perform a three-step analysis process:

1. Data collection and aggregation through web scraping
1. NLP text processing and sentiment analysis using a Naive Bayes model 
1. NPS calculations to aggregate the results of the sentiment analysis and create a metric that can easily be interpreted and compared

I designed this web app to allow users to execute each of these three steps separately so that the fuctionality can be used to perhaps suit different purposes

To execute this analysis process on the app we can do the following:

1. Start at the 'Webscraping' page and get the comments data
1. Merge the scraped data into a ready-to-analyze-dataset we want to analyze
1. Perform the sentiment analysis in the 'Assign Sentiment Score to Comments' page OR perform the sentiment analysis and NPS scoring together on the 'Get NPS Score' page

### 2.1) Sample Outputs

To Add 

### 2.2) Detailed Step-by-Step Usage

#### Step 1: Webscraping

The webscraper uses the Apify SDK which runs on Node.js (Javascript)

[Apify SDK Documentation](https://sdk.apify.com/)
[Apify npm page](https://www.npmjs.com/package/apify)

The app runs a Puppeteer Headless Chromium Browser Scraper through Apify. 
A headless browser is a controllable web browser that just doesn’t have a gui
            (you don’t see it running) but you can program it to do specific tasks very quickly and automatically.
            
The scraper aggregates the comments into a large .json file (looks very cluttered) and this .json file is converted into table
              format and stored/downloaded as a .csv file
 
JSON file from the webscraper:

![JSON Output](/public/images/webscrape_images/webscrape_json.png)


CSV file after processing:

![CSV Output](/public/images/webscrape_images/webscrape_csv.png)


#### Step 2: NLP comment categorization and sentiment analysis

The goal of this step is to accurately analyze the sentiment for the comments we have scraped.
However we want the sentiment analysis to be as specific as possible.
What aspects about the product do customers like? What do they dislike?
To motivate the need for segmentation a bit more, suppose a comment reads “The packaging is very well designed.
It’s way too expensive. It tastes pretty average”. If we simply assigned a sentiment score to that entire comment,
it would probably amount to something pretty average, and would not tell us a whole lot, but if we can break that
comment down into three segments and perform sentiment analysis on each segment, we can determine the comment is positive about packaging,
negative about price, and neutral/negative about taste. This gives us a lot more information than if we just perform the sentiment analysis in aggregate

##### Substep 1: comment categorization

1. Assign keywords to each category
2. Identify and aggregate the sentences/phrases that contain these keywords for each comment

Example comment text filtered by category keywords:

![Filtered text](/public/images/flavor_example/price_keywords.png)

##### Substep 2: sentiment analysis

Next, the app uses an NLP sentiment analysis model to assign a sentiment score to the categorized text. The score ranges from 0 (negative) to 1 (positive)

The model used for sentiment analysis is a Naive Bayes model from the SnowNLP python library -- an NLP library that has been trained and optimized for Chinese NLP

[SnowNLP Link Github](https://github.com/isnowfy/snownlp)
[In-depth discussion of SnowNLP implementation of sentiment analysis](https://www.programmersought.com/article/25894599744/)


##### Sidenote: training the sentiment analysis model

The sentiment analysis model is already trained with tens of thousands of e-commerce site comments, but it might not be familiar with specific aspects or vocabulary associated with certain categories. Before performing the analysis
                        it might be necessary to train the model by giving it examples of positive comments and negative comments. The training data ideally must not be data that will end up being used in the sentiment analysis that you do later on!
                        
#### Step 3: NPS calculations and output generation                        
                     
Finally to arrive at an easily comparable and interpretable metric, we can create an NPS (net promoter score)
                          for different products and different aspects of each product
                          
For the purposes of this analysis, the NPS score = % of positive comments - % of negative comments                     


