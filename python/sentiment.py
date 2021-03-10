import json
import numpy as np
import pandas as pd
import re
import os.path
from snownlp import SnowNLP

def test_import():
    print("nani")

###
# FUNCTION 3) overall_sentiment ====
#
# takes a dataframe of comments and assigns a sentiment to each of them, with optional keyword subsetting
#
# ===== input description =====
# df (pandas dataframe): dataframe of comments
# keywords (array of strings): array of keywords that relate to
# key phrases that we want to isolate for sentiment analysis (ie. related to 效果)
# ===== output description ========
# ret_df (pandas dataframe): merged dataframe with all the comments, platform, and date data
###

def overall_sentiment(df, keywords=[]):
    # if input is string, convert it to a pandas df
    if isinstance(df, str):
        df = pd.read_csv(df)
    # drop duplicate comments, useless comments, convert datatype just to be sure
    df = df.loc[~df['comment'].str.contains("此用户没有"),]
    df = df.drop_duplicates()
    df = df.reset_index()
    df['comment'] = df['comment'].astype(str)
    # assign sentiment scores
    sentiment_arr = []
    if len(keywords) == 0:
        for p in range(len(df)):
            comment = df.loc[p]['comment']
            s = SnowNLP(comment)
            sentiment_arr.append(s.sentiments)
        df['sentiment_score'] = pd.Series(sentiment_arr, index=df.index)
        return df
    else:
        for p in range(len(df)):
            sentiment_text = ""
            comment = df.loc[p]['comment']
            comment_sentences = np.array(re.split('。|，|！', comment))
            for i in keywords:
            # see if any of the setences match the subset
            # create mask array
                mask_array = np.array([bool(re.search(i, j)) for j in comment_sentences])
                matched_sentences = comment_sentences[mask_array]
                for k in matched_sentences:
                    sentiment_text += k
                    sentiment_text += '。'
            #run the sentiment analysis only on that sentence and append it to the comment df
            if len(sentiment_text) > 0:
#                 print(sentiment_text)
                s = SnowNLP(sentiment_text)
                sentiment_arr.append(s.sentiments)
            else:
                sentiment_arr.append(None)
#         print(len(sentiment_arr))
        #==== add sentiment score to existing dataframe
        df['sentiment_score'] = pd.Series(sentiment_arr, index=df.index)
        #==== remove none and null values
        df = df[df['sentiment_score'].notna()]
        df = df[df['sentiment_score'].notnull()]
#         print("df length after removing null values")
        print(len(df.index))
        return df;

###
# FUNCTION 4) category_sentiment ====
#
# takes a dataframe of comments and performs sentiment analysis with keyword subsetting outputs a
# dictionary of dataframes for results from each category's subset analysis
#
# ===== input description =====
# df (pandas dataframe): dataframe of comments
# keywords (2D array of strings): array of keywords that relate to each category for subsetting comment text
# category_names (array of strings): array of category names that correspond to each subarray
# of the keywords array
# ===== output description ========
# ret_df_dict: dictionary of dataframes (one daataframe for each category)
###

def category_sentiment(df, keywords, category_names):
    # check if the keywords length and cat_names length are the same, else throw an exception
    if (len(keywords) != len(category_names)):
        raise Exception("# of Keyword arrays and category names lengths of folders must be the same")
    #define the output dataframe dictionary that we will return
    df_outputs = {}
    # if input is string, convert it to a pandas df
    if isinstance(df, str):
        df = pd.read_csv(df)
    # make sure df is alright. Make copy for multiple iterations
    df['comment'] = df['comment'].astype(str)
    df_original = df
    # enter loop for each category
    for ind in range(len(keywords)):
        df = df_original
        sentiment_arr = []
            #split comment into sentences
        for p in range(len(df)):
            sentiment_text = ""
            comment = df.loc[p]['comment']
            comment_sentences = np.array(re.split('。|，|！', comment))
            #do a regex search for the category keywords and isolate the sentence(s) that contains the dimension in question
            for i in keywords[ind]:
                # see if any of the setences match the subset
                # create mask array
                mask_array = np.array([bool(re.search(i, j)) for j in comment_sentences])
                matched_sentences = comment_sentences[mask_array]
                for k in matched_sentences:
                    sentiment_text += k
                    sentiment_text += '。'
                #run the sentiment analysis only on that sentence and append it to the comment df
            if len(sentiment_text) > 0:
#                 print(sentiment_text)
                s = SnowNLP(sentiment_text)
                sentiment_arr.append(s.sentiments)
            else:
                sentiment_arr.append(None)
#         print(len(sentiment_arr))
    #==== add sentiment score to existing dataframe
        df['sentiment_score'] = pd.Series(sentiment_arr, index=df.index)
    #===== append to df dictionary. Get rid of any NULL values for the sentiment score
        df = df[df['sentiment_score'].notna()]
        df = df[df['sentiment_score'].notnull()]
        print("number of comments matching category " + category_names[ind] + ': ' + str(len(df.index)))
        df_outputs[category_names[ind]] = df
    return df_outputs

###
# FUNCTION 5) product_sentiment ====
#
# does sentiment analysis subsetted by products with optional keyword filtering
#
# ===== input description =====
# df (pandas dataframe): dataframe of comments
# keywords (array of strings): array of keywords that relate to each category for subsetting comment text
# product_names (array of strings): array of product names that correspond to each subarray
# of the keywords array
# ===== output description ========
# df_product_outputs: dictionary of dataframes (one daataframe for each category)
###

def product_sentiment(df, keywords, product_names):
    # if input is string, convert it to a pandas df
    if isinstance(df, str):
        df = pd.read_csv(df)
    # returned dictionary
    df_product_outputs = {}
    # drop duplicate comments, useless comments, convert datatype just to be sure
    df = df.loc[~df['comment'].str.contains("此用户没有"),]
    df = df.drop_duplicates()
    df = df.reset_index()
    df['comment'] = df['comment'].astype(str)
    # assign sentiment scores
    sentiment_arr = []
    if len(keywords) == 0:
        for p in range(len(df)):
            comment = df.loc[p]['comment']
            s = SnowNLP(comment)
            sentiment_arr.append(s.sentiments)
        df['sentiment_score'] = pd.Series(sentiment_arr, index=df.index)
    else:
        for p in range(len(df)):
            sentiment_text = ""
            comment = df.loc[p]['comment']
            comment_sentences = np.array(re.split('。|，|！', comment))
            for i in keywords:
            # see if any of the setences match the subset
            # create mask array
                mask_array = np.array([bool(re.search(i, j)) for j in comment_sentences])
                matched_sentences = comment_sentences[mask_array]
                for k in matched_sentences:
                    sentiment_text += k
                    sentiment_text += '。'
            #run the sentiment analysis only on that sentence and append it to the comment df
            if len(sentiment_text) > 0:
#                 print(sentiment_text)
                s = SnowNLP(sentiment_text)
                sentiment_arr.append(s.sentiments)
            else:
                sentiment_arr.append(None)
#         print(len(sentiment_arr))
        #==== add sentiment score to existing dataframe
        df['sentiment_score'] = pd.Series(sentiment_arr, index=df.index)
        #==== remove none and null values
        df = df[df['sentiment_score'].notna()]
        df = df[df['sentiment_score'].notnull()]
#         print("df length after removing null values")

        #===== split returned df into product subsetted dfs=====
    for ind in range(len(product_names)):
        # filter out by products aand push to the df_product_outputs array
        product_df = df[df['product'] == product_names[ind]]
        product_df = product_df.reset_index()
        print("number of comments matching product " + product_names[ind] + ': ' + str(len(product_df.index)))
        df_product_outputs[product_names[ind]] = product_df
    return df_product_outputs
