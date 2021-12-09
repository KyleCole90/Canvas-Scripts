import requests
import json

key = "Bearer " ### API Token
domain = "" ### Canvas Domain 
user_id = ""  # Canvas User Id

###### Do not edit below#### 

headers = {
    'Authorization': key
}

r = requests.delete(domain + "/api/v1/users/" + user_id + "/sessions", headers=headers)
