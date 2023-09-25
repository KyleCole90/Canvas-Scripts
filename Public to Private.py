import csv
import requests

# Define your Canvas domain and API token
canvas_domain = "YOUR_CANVAS_DOMAIN"
auth_token = "YOUR_API_TOKEN"

# Specify the name of the CSV file with course IDs
csv_file_path = 'courses.csv'

# Open the CSV file and create a CSV reader
with open(csv_file_path, mode='r', encoding='utf-8-sig') as csv_file:
    csv_reader = csv.reader(csv_file)
    
    # Skip the header row if it exists
    next(csv_reader, None)
    
    # Loop through the CSV rows
    for row in csv_reader:
        course_id = row[0]
        url = f"{canvas_domain}/api/v1/courses/{course_id}?course[is_public]=false"
        
        # Create the headers dictionary with the API token
        headers = {
            'Authorization': f"Bearer {auth_token}"
        }
        
        # Send a PUT request to update course visibility
        response = requests.put(url, headers=headers)
        
        # Check the response status code and print the result
        if response.status_code == 200:
            print(f"Course ID {course_id} visibility updated successfully.")
        else:
            print(f"Failed to update course ID {course_id} visibility. Status code: {response.status_code}")
