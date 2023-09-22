import requests
import csv
import pdfkit

#Enter the values inbetween the quotes
canvas_domain = ""  ### Canvas Domain
auth_token = ""  ### API Token
courses_csv = ""  ### Path to Courses Provisioning Report
file_path = ""  ### Path to where you want the PDF saved

########################## Don't edit below ##########################


# Open the CSV file containing course data for reading
courses_reader = open(courses_csv, encoding="utf-8-sig")
courses = csv.reader(courses_reader)

# Create a CSV file for cases where syllabus retrieval fails
no_syllabus_file = open("No_syllabus.csv", mode="w", newline="", encoding="utf-8-sig")
no_syllabus_writer = csv.writer(no_syllabus_file)

# Write headers to the "No_syllabus.csv" file
no_syllabus_writer.writerow(["Canvas ID", "SIS ID", "Status"])

#Skip header row in the courses provisioning report
next(courses)

#Going through each row grabbing the syllabus or printing an error message
for row in courses:
    canvas_id = row[0]
    sis_id = row[1]
    url = f"{canvas_domain}/api/v1/courses/{canvas_id}?include[]=syllabus_body"
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        syllabus_data = response.json()
        syllabus_body = syllabus_data.get("syllabus_body")
        if syllabus_body is None:
            message = f"Syllabus body is null for {canvas_id}. Doing nothing."
            print(message)
            no_syllabus_writer.writerow([canvas_id, sis_id, message])
        else:
            pdf_file_path = f"{file_path}/{canvas_id}_{sis_id}.pdf"
            pdfkit.from_string(syllabus_body, pdf_file_path)
            print(f"{canvas_id} Syllabus body converted to PDF: {pdf_file_path}")
    else:
        message = f"Failed to retrieve syllabus for {canvas_id}. Status code: {response.status_code}"
        print(message)
        no_syllabus_writer.writerow([canvas_id, sis_id, message])

#Close the No Syllabus csv
no_syllabus_file.close()
