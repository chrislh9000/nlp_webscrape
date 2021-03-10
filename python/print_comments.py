import sys
import numpy as np
import os
import sentiment
import nlp
import re
import file_read
import print_comments
import pandas as pd
import sentiment

#=========== BATCH 4: MISC Calculations =========
###
# FUNCTION 10) print_commments ====
#
# prints most negative or positive comments by default top 30 positive comments
#
# ===== input description =====
# df: a single df of comments that are scored by sentiment
###

def print_comments(df, c_type='positive', num=30):
    # if input is string, convert it to a pandas df
    if isinstance(df, str):
        df = pd.read_csv(df)
    if c_type == 'positive':
        opt = False
    if c_type == 'negative':
        opt = True

    df = sentiment.overall_sentiment(df, [])
    # sort df comment by sentiment
    df = df.sort_values('sentiment_score', ascending=opt)
    df = df.reset_index()
    # print the first 30 comments
    for i in range(1, num):
        print(c_type + " COMMENT #" + str(i))
        print(df.loc[i]['comment'])

###
# TO DO: FUNCTION 11) word_cloud ====
#
# formats comments into proper word cloud input and creates a sample word cloud
#
# ===== input description =====
# df: a single df of comments that are scored by sentiment
###

def word_cloud(df):
    wordcloud_text = ""
    for p in range(len(df)):
        comment = df.loc[p]['comment']
        wordcloud_text = wordcloud_text + comment
    #do some text cleaning (remove punctuation, filler words etc.)

    #output wordcloud text
    print("Workin' on it")
    return 0;
