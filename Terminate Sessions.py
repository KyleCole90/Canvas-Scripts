import requests
import csv

key = "Bearer " ### API Token
canvas = " " ### Canvas Domain 
id = open ('user.csv', encoding='utf-8-sig') ##### Pull Users.CSV and name it user.csv
print(id)
domain = csv.reader(id)
print(domain)
###### Do not edit below#### 

headers = {
    'Authorization': key
}

print(id)
domain = csv.reader(id)
print(domain)

for row in domain:
    id=(row[0])
    url = canvas + "/api/v1/users/" + id + "/sessions"
    print(url)
    headers = {
        'Authorization': key
    }
    response = requests.request("Delete",url,headers=headers)
    print(response)
