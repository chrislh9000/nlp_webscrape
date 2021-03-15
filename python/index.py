import sys
import numpy as np
import os
import sentiment
import nlp
import re
import file_read
import print_comments

#first read in what function to run
opt = sys.argv[1]
#===== conducts nlp scoring
if opt == 'nlp':
    print("running nlp script")
    mode = sys.argv[3]
    if mode == 'overall':
        nlp.nps_breakdown(sys.argv[2], sys.argv[3])
    elif mode == 'product':
        #we must first parse the product input and format it correctly
        products = sys.argv[5]
        #get rid of empty space then split into array via comments
        products = re.sub('[ ]', '', products)
        product_arr = np.array(re.split(',|, ', products))
        #get effectiveness keywords ready to input into function
        product_keywords = sys.argv[4]
        product_keywords = re.sub('[ ]', '', product_keywords)
        product_keywords = re.sub('[\']', '', product_keywords)
        keywords_arr = np.array(re.split(',|, ', product_keywords))
        nlp.nps_breakdown(sys.argv[2], sys.argv[3], keywords_arr, product_arr)
    elif mode == 'category':
        #we must take a 2D array
        category = sys.argv[5]
        category_keywords = sys.argv[4]
        #condense the keyword inputs, removing spaces and quotation marks from the inputs
        category_keywords = re.sub('[\']', '', category_keywords)
        category_keywords = re.sub('[ ]', '', category_keywords)
        #do the same for the category names
        category = re.sub('[ ]', '', category)
        category_names = np.array(re.split(',|, ', category))
        category_split = np.array(re.split(';|; ', category_keywords))
        keywords_arr = []
        for i in category_split:
            temp_arr = np.array(re.split(',|, ', i))
            keywords_arr.append(temp_arr)
        nlp.nps_breakdown(sys.argv[2], 'category', keywords_arr, category_names)
#===== downloads comments with sentiment scoring
elif opt == 'sentiment':
    print("running sentiment script")
    mode = sys.argv[3]
    if mode == 'overall':
        df = sentiment.overall_sentiment(sys.argv[2])
        df.to_csv('df_download.csv', index = False)
        print('df_download.csv')
    elif mode == 'product':
        #====== ready keyword and category inputs
        products = sys.argv[5]
        #products
        product_arr = [products]
        #keywords
        product_keywords = sys.argv[4]
        if product_keywords == '':
            keywords_arr = []
        else:
            product_keywords = re.sub('[ ]', '', product_keywords)
            product_keywords = re.sub('[\']', '', product_keywords)
            keywords_arr = re.split(',|, ', product_keywords)
        #====== download the one dataset that is specified
        df_outputs = sentiment.product_sentiment(sys.argv[2], keywords_arr, product_arr)
        df = df_outputs[sys.argv[5]]
        # df = df.reset_index()
        df.to_csv('df_download.csv', index = False)
        print("df_download.csv")
    elif mode == 'category':
        #====== ready keyword and category inputs
        category = sys.argv[5]
        #products
        category_arr = [category]
        #keywords
        category_keywords = sys.argv[4]
        if category_keywords == 'null':
            keywords_arr = []
        else:
            category_keywords = re.sub('[ ]', '', category_keywords)
            category_keywords = re.sub('[\']', '', category_keywords)
            keywords_arr = np.array(re.split(',|, ', category_keywords))
            keywords_arr = [keywords_arr]
        #====== download the one dataset that is specified
        df_outputs = sentiment.category_sentiment(sys.argv[2], keywords_arr, category_arr)
        df = df_outputs[sys.argv[5]]
        # df = df.reset_index()
        df.to_csv('df_download.csv', index = False)
        print("df_download.csv")

#===== prints top negative and positive comments
elif opt == 'print_comments':
    print("running print comments script")
    print_comments.print_comments(sys.argv[2], sys.argv[3])
#===== downloads webscraped comments into a csv file to be analyzed
elif opt == 'webscrape_download':
    print("running webscrape_download script")
    df = file_read.megajson_to_dataset(sys.argv[2], sys.argv[3])
    df.to_csv('webscraped_download.csv', index = False)
    print('webscraped_download.csv')
else:
    print("invalid function option run")
