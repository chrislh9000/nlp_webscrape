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
