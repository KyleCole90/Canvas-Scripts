import requests
import json

key = "Bearer " #### Add API Key After Bearer
domain = "" #### Add domain into quotes Example: https://HackerPanda.instructure.com
user_id = "" ### Canvas User Id
start = "" ### Start Time in UTC Time example 2021-04-20T00:00:00Z
end = "" ### End Time in UTC Time



############## Do not change #################
headers = {
       'Authorization': key
}

data_set = []
next_check = 'default'

r = requests.get(domain + "/api/v1/users/9526/page_views?start_time=" + start + "&end_time=" + end + "&per_page=100", headers=headers)
next_ = r.links['next']['url']
d = r.json()
data_set.append(d)

while next_check != 'null':
       r = requests.get(next_, headers=headers)
       next_d = r.json()
       data_set.append(next_d)
       next_check = r.links.get('next', 'null')
       if next_check != 'null':
              next_ = r.links['next']['url']

#print(json.dumps(data_set, indent=4))
file = open("requests.txt", "w")
file.write(json.dumps(data_set, indent=4))
file.close()