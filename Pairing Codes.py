import requests
import csv

# Set your Canvas API URL and token in the quotes
canvas_url = ''
api_token = ''


headers = {
    'Authorization': f'Bearer {api_token}'
}

# Get all students from Canvas
students = []
page = 1
while True:
    response = requests.get(f'{canvas_url}/api/v1/accounts/self/users', params={
        'enrollment_type': 'student',
        'per_page': 100,
        'page': page
    }, headers=headers)
    
    data = response.json()
    students.extend(data)
    
    if 'next' in response.links:
        page += 1
    else:
        break

# Write student data to a CSV file
with open('student_data.csv', 'w', newline='') as csvfile:
    csvwriter = csv.writer(csvfile)
    csvwriter.writerow(['id','name', 'sis_user_id', 'login_id'])
    for student in students:
        csvwriter.writerow([student['id'], student['name'], student['sis_user_id'], student['login_id']])

# Generate pairing codes and write data to the CSV file
with open('student_data.csv', 'r') as csvfile, open('student_data_with_pairing.csv', 'w', newline='') as pair_csvfile:
    csvreader = csv.reader(csvfile)
    pair_csvwriter = csv.writer(pair_csvfile)
    
    # Write header row for pairing CSV
    pair_csvwriter.writerow(['id','name', 'sis_user_id', 'login_id', 'pairing_code', 'expires_at'])
    
    next(csvreader)  # Skip header row
    for row in csvreader:
        student_id = row[0]
        pair_response = requests.post(f'{canvas_url}/api/v1/users/{student_id}/observer_pairing_codes', headers=headers)
        pair_data = pair_response.json()
        
        pair_csvwriter.writerow([student_id, row[1], row[2],row[3], pair_data.get('code', ''), pair_data.get('expires_at', '')])
            
print("Process completed.")

