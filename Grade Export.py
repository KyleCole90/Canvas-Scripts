##### Unsupported and may or may not work ######
##### Only used to get you started ######


import requests
import os
import time
import sys
from apscheduler.schedulers.background import BackgroundScheduler

#                                    *-*-*-*-*-*-* Creates a grade export report and saves it's download link to a text file *-*-*-*-*-*-*

subdomain = ""                             #*-*-*-*-* Subdomain of the client

path = os.path.expanduser("")   #*-*-*-*-* Change to the path you'd like to save the file to.
                                                    #*-*-*-*-*        Change the filename if you don't want
                                                    #*-*-*-*-*        to overwrite the previous file.

term_id = ''                                    #*-*-*-*-* Enter the term ID for the term you want the report of

time_between_checks =                             #*-*-*-*-* Change the number of seconds between progress checks

key = ''   #*-*-*-*-* Your OAuth key

#########Only edit below if you are leveled for the encounter###########

headers = {
       'Authorization': key
}

parameters = {
       'parameters[terms]': term_id
}


def createReport():
       response = requests.request("POST", "https://" + subdomain + ".instructure.com/api/v1/accounts/1/reports/grade_export_csv", headers=headers, params=parameters)
       if response.status_code != 200:
              print("Could not connect")
              sys.exit()


def urlSave():
    listresponse = requests.get("https: // " + subdomain + ".instructure.com/api/v1/accounts/1/reports/grade_export_csv", headers=headers)
       if listresponse.status_code == 200:
              newest_report = listresponse.json()[0]
              if newest_report['progress'] == 100:
                     url = newest_report['attachment']['url']
                     file = open(path, 'r+')
                     file.truncate(0)
                     file.write(url)
                     sys.exit()


createReport()


if __name__ == '__main__':
    scheduler = BackgroundScheduler()
    scheduler.add_job(urlSave, 'interval', seconds=time_between_checks)
    scheduler.start()

    try:
        while True:
            time.sleep(2)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
