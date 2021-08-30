##### Download the public courses report #####
##### Place it in the same folder as script ####

import csv
import requests

canvas = " " #### Canvas Domain Goes Here
key = '' ##### API Key
id = open ('', encoding='utf-8-sig') ##### Name of CSV
print(id)
domain = csv.reader(id)
print(domain)

for row in domain:
    id=(row[0])
    url = canvas + ".instructure.com/api/v1/courses/" +
        id + "?course[is_public]=false"
    print(url)
    headers = {
        'Authorization': key
    }
    response = requests.request("Put",url,headers=headers)
    print(response)
