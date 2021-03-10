import sys
import numpy as np
import os
import nlp

effect_keywords = ['效','有用','没用','实用','使用','用']
flavor_keywords = ['口感','味道','味','香','甜','酸','好吃','色','苦','硬','软'
                    ,'颗粒大','吞','咬不动','吃起来','个头大','好大','难吃']
packaging_keywords = ['包装','盒','贴纸','外形','分量','外表']
expiration_keywords = ['保质期','过期','保留','新鲜']
price_keywords = ['价格','便宜','贵','打折','份量','实惠']
# source_keywords = ['渠道','来源','推荐','朋友','网站','听说','发现','抖音','同事','亲戚','广告',
#                   '小红书', '微信']
logistic_keywords = ['物流','快递','配送','退货','运送']
keywords_array = [price_keywords, expiration_keywords, flavor_keywords,
                  logistic_keywords, packaging_keywords]

cat_array = ['price', 'expiration', 'flavor', 'logistics', 'packaging']
product_array = ['SLEEP', 'EAT', 'VC', 'ENERGY', 'EYES']

print(type(sys.argv[1]))
print(os.getcwd())
a = np.array([1,2,3,4,5])
print(a)
nlp.nps_breakdown("/Users/chemm/ince_nlpwebscrape_webapp/python/buffx_dataset.csv", 'overall')
