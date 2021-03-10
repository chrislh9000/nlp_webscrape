import json
import numpy as np
import pandas as pd
import re
import os.path
from snownlp import SnowNLP
import sentiment

#=========== BATCH 3: NPS Calculations ==========

###
# FUNCTION 6) populate_weights ====
#
# helper function that helps output sample size and weightings for weighted nps calculation
#
# ===== input description =====
# df_outputs (dictionary of pandas dataframe): dataframe of comments
# key_array: array of dictionary keys depending on product or category

# ===== output description ========
# category_lengths: dictionary of integers with the number of comments in each subset dataframe
# category_weights: dictionary of integers from 0 to 1 with a sample size based weighting for weighted nps calculation
###

def populate_weights(df_outputs):
    # get the keys from the df dictionary
    keywords_arr = [*df_outputs]
    total_comments = 0
    category_lengths = {}
    category_weights = {}
    for i in keywords_arr:
        category_lengths[i] = (len(df_outputs[i].index)) #populate cat lengths
        total_comments += len(df_outputs[i].index)
    for i in keywords_arr:
        category_weights[i] = category_lengths[i] / total_comments
    return category_lengths, category_weights

###
# FUNCTION 7) nps_score ====
#
# helper function that outputs a dictionary of nps scores for each product or category
#
# ===== input description =====
# df_outputs (dictionary of pandas dataframe): dataframe of comments
# opt: could be a dataframe for total nps which just outputs an int or dict which outputs an dictionary of ints

# ===== output description ========
# nps_dict/nps_score: dictionary of ints/int of nps scores
###

def nps_score(df_outputs, opt='list'):
    # if its just overall nps, you just have to output one number so we can check that case first
    if opt == 'overall':
        total_ratings = len(df_outputs.index)
        percent_positive = len(df_outputs.loc[(df_outputs.sentiment_score > 0.8)])/total_ratings
        percent_negative = len(df_outputs.loc[(df_outputs.sentiment_score < 0.3)])/total_ratings
        nps = percent_positive - percent_negative
        return nps
    nps_dict = {}
    keywords_arr = [*df_outputs]
    for i in keywords_arr:
        #==== assign positive, negative and neutral values
        total_ratings = len(df_outputs[i].index)
        positive_ratings = len(df_outputs[i].loc[(df_outputs[i].sentiment_score > 0.8)])
        percent_positive = len(df_outputs[i].loc[(df_outputs[i].sentiment_score > 0.8)])/total_ratings
        percent_negative = len(df_outputs[i].loc[(df_outputs[i].sentiment_score < 0.3)])/total_ratings
        nps = percent_positive - percent_negative
        nps_dict[i] = nps
    return nps_dict

###
# FUNCTION 8) print_nps ====
#
# prints nps information, including product/category-specific
# nps figures and then a weighted nps score
#
# ===== input description =====
# df_outputs: dictionary of dataframes, or a single dataframe
###

def print_nps(df_outputs, opt='list'):
    if opt == 'overall':
        nps_dict = nps_score(df_outputs, 'overall')
        print("NPS is: " + str(round(nps_dict * 100, 2)))
        return 0
    nps_dict = nps_score(df_outputs)
    keywords_arr = [*nps_dict]
    category_lengths, category_weights = populate_weights(df_outputs)
    weighted_nps = 0
    for i in keywords_arr:
        print("LENGTH, WEIGHT, NPS OF " + i + " is: " + str(category_lengths[i]) + ', '
             + str(category_weights[i]) + ', ' + str(round(nps_dict[i] * 100, 2)))
        weighted_nps += nps_dict[i] * category_weights[i]
    print('WEIGHTED NPS IS : ' + str(round(weighted_nps*100, 2)))

###
# FUNCTION 9) nps_breakdown ====
#
# cumulative function that takes in a full dataset and can do
# product, category and overall sentiment analysis and output nps values
#
# ===== input description =====
# df: string or pandas dataframe of dataset that we want to do nps analysis for
# analysis_type: product, category, or overall
# keywords_arr: 2D array of keywords to subset comments for each segmentation
# segmentation_arr: names for df to be segmented by (ie. product or channel or category)

# ===== output description ========
# nps_dict: nps output based on segmentation and potentially weighted nps
###

def nps_breakdown(df, breakdown_type='overall', keywords_arr=[], segmentation_arr=[]):
    # if input is string, convert it to a pandas df
    if isinstance(df, str):
        df = pd.read_csv(df)
    #do overall case because that one is the easiest
    if breakdown_type == 'overall':
        #do the sentiment analysis
        output_df = sentiment.overall_sentiment(df, keywords_arr)
        #output the nps score stuff
        print_nps(output_df, 'overall')
        return 1
    #now run either product or category script depending on what is called
    if breakdown_type == 'category':
        #do the sentiment analysis
        output_df = sentiment.category_sentiment(df, keywords_arr, segmentation_arr)
        #output the nps score stuff
        print_nps(output_df, 'list')
        return 1
    if breakdown_type == 'product':
        #do the sentiment analysis
        output_df = sentiment.product_sentiment(df, keywords_arr, segmentation_arr)
        #output the nps score stuff
        print_nps(output_df, 'list')
        return 1
    else:
        raise Exception("must be of type product, overall, or category")
