import requests
import csv

# Define your API token, Canvas domain, and the path to the CSV file
auth_token = "YOUR_API_TOKEN"
canvas_domain = "YOUR_CANVAS_DOMAIN"
csv_file_path = 'user.csv'

# Open the CSV file and create a CSV reader
with open(csv_file_path, mode='r', encoding='utf-8-sig') as csv_file:
    csv_reader = csv.reader(csv_file)
    
    # Skip the header row if it exists
    next(csv_reader, None)
    
    # Loop through the CSV rows
    for row in csv_reader:
        user_id = row[0]
        url = f"{canvas_domain}/api/v1/users/{user_id}/sessions"
        
        # Create the headers dictionary with the API token
        headers = {
            'Authorization': f"Bearer {auth_token}"
        }
        
        # Send a DELETE request
        response = requests.delete(url, headers=headers)
        
        # Check the response status code and print the result
        if response.status_code == 200:
            print(f"Session for user ID {user_id} deleted successfully.")
        else:
            print(f"Failed to delete session for user ID {user_id}. Status code: {response.status_code}")
