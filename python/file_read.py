#=========== BATCH 1: FILE READING AND DATA PROCESSING FUNCTIONS ==========
import json
import numpy as np
import pandas as pd
import re
import os.path
from snownlp import SnowNLP

###
# FUNCTION 1) json_to_dataset ====
#
# takes an array of folder names and length of the scrape results and creates a unified pandas dataframe
# containing the product, comment, platform, and other relevant information. Must also include file_path of the folders
#
# ===== input description =====
# folders (array): array of strings (folder names) preferrably in the format channel_brand_product
# lengths (array) : array of ints specifying the number of comments scraped
# filepath (string): string specifying file path of the comments
#
# ===== output description ========
# ret_df: merged dataframe with all the comments, platform, and date data
###

def json_to_dataset(folders, lengths, file_path):
    # error checking/handling
    if (len(folders) != len(lengths)):
        raise Exception("Folders and lengths of folders must be the same")
    file_string = '000000000'
    ret_df = pd.DataFrame()
    for l in range(len(folders)):
        file_path_json = []
        # access the folder
        for ind in range(1, lengths[l]):
            file_path_json.append(file_path + folders[l] + "/" +
                          file_string[:len(file_string) - len(str(ind))] + str(ind) + ".json")
        #==== create a list of json files ========
        compressed_file = []
        for ind in range(len(file_path_json)):
            with open(file_path_json[ind]) as f:
                compressed_file.append(json.load(f))
        #==== convert json files to pandas df ========
        comments_df = pd.DataFrame()
        for ind in range(len(compressed_file)):
            comments_df = comments_df.append(pd.json_normalize \
                                                 (compressed_file[ind]))
        #==== get product and channel and append to comments_df
        dataset_info = np.array(re.split('_', folders[l]))
        comments_df['platform'] = dataset_info[2]
        comments_df['product'] = dataset_info[1]
        #==== TODO: REMOVE DUPLICATES AND NO COMMENT CASES
        comments_df = comments_df.drop_duplicates()
        comment_df = comments_df.loc[~comments_df['comment'].str.contains("此用户没有"),]
        comments_df = comments_df.reset_index()
        #==== append pandas df to an existing df =======
        ret_df = ret_df.append(comments_df, ignore_index = True)
    return ret_df

###
# FUNCTION 1.5) megajson_to_dataset ====
#
# takes one big json dataset file, converts it to a pandas dataframe, and returns it
#
# ===== input description =====
# filename (array): the name of the json file

def megajson_to_dataset(filename, product):
    with open(filename, encoding='utf-8-sig') as f:
        file = json.load(f)
    # retrieve the json data
    json_data = file['data']
    # we will be returning the comments_df
    comments_df = pd.DataFrame()
    for i in range(len(json_data)):
        row = json.loads(json_data[i])
        comments_df = comments_df.append(row, ignore_index=True)
    #==== remove duplicates and useless comments
    comments_df = comments_df.drop_duplicates()
    comments_df = comments_df.loc[~comments_df['comment'].str.contains("此用户没有"),]
    comments_df = comments_df.reset_index()
    comments_df['product'] = product
    return comments_df




###
# FUNCTION 2) csv_merge ====
#
# takes several csv files and merges them together, cleans them and downloads a finalized dataset for nlp analysis
#
# ===== input description =====
# directory (string): string that specifies the path of the csv files
# filenames (array) : array of strings specifying the csv files to be merged
#
# ===== output description ========
# ret_df: merged dataframe with all the comments, platform, and date data
###

def csv_merge(directory, filenames):
    ret_df = pd.DataFrame()
    for name in filenames:
        #read the csv
        temp_df = pd.read_csv(directory + name)
        #append to ret_df
        ret_df = ret_df.append(temp_df, ignore_index = True)
    #remove duplicates and useless comments, reset index of df
    ret_df = ret_df.drop_duplicates()
    ret_df = ret_df.loc[ret_df.comment != '此用户没有填写评论!。']
    ret_df = ret_df.reset_index()
    return ret_df
