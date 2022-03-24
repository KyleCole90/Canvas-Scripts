import csv
import requests

canvas = ""  # Canvas Domain Goes Here
key = ""  # API Key
id = open ('nameofcsv.csv', encoding='utf-8-sig') ##### Name of CSV
domain = csv.reader(id)

for row in domain:
    id=(row[0])
    url = canvas + "/api/v1/accounts/1/users/" + id
    print(url)
    headers = {
        'Authorization': key
    }
    response = requests.request("Delete",url,headers=headers)
    print(response)
