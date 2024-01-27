import cv2
from simple_facerec import SimpleFacerec
from datetime import datetime, timedelta
import face_recognition
import requests
import os

# URLs of known faces
result = []

photos_url = "http://192.168.250.81:8000/api/photos"

response = requests.get(photos_url)
if response.status_code == 200:
    result = response.json()
    print(result)
else:
    print("Server is down")

# Video capture from webcam
cap1 = cv2.VideoCapture(0)
sfr1 = SimpleFacerec()

# Face recognition threshold
threshold_distance = 10

# Timer for response time
last_response_time = datetime.now() - timedelta(minutes=2)

# Load known face encodings from URLs
for url in result:
    sfr1.load_encoding_image_url(url)

while True:
    # Read frame from webcam
    ret1, frame1 = cap1.read()

    # Detect known faces in the frame
    face_locations, face_names, face_urls = sfr1.detect_known_faces(frame1)

    # Variables for detected doctor information
    doctor_detected = False
    name = "Unknown"
    url = ""

    # Process detected faces
    if len(face_locations) > 0:
        for face_loc, detected_name, detected_url in zip(face_locations, face_names, face_urls):
            y1, x2, y2, x1 = face_loc[0], face_loc[1], face_loc[2], face_loc[3]

            # Compute face distance
            face_encodings = face_recognition.face_encodings(frame1, [face_loc])[
                0]
            face_distances = face_recognition.face_distance(
                sfr1.known_face_encodings, face_encodings)

            # Check if there is at least one valid face distance
            if face_distances.any() and face_distances.min() < threshold_distance:
                doctor_detected = True

            # Extract name and URL
            name = detected_name
            name = name.replace("%20", " ")
            url = detected_url

            # Draw bounding box and name on the frame
            cv2.putText(frame1, f"{name}", (x1, y1 - 10), cv2.FONT_HERSHEY_DUPLEX, 1,
                        (0, 0, 200), 2)
            cv2.rectangle(frame1, (x1, y1), (x2, y2), (0, 0, 200), 4)

    # Check if a doctor is detected and response time has elapsed
    if doctor_detected and (datetime.now() - last_response_time).total_seconds() >= 20:
        current_time = datetime.now().strftime("%H:%M:%S")
        log_message = f"{name.split("-")[-1]} found in Cam1 - Time {current_time}"
        print(log_message)

        # Uncomment the following lines to enable requests
        response = requests.post(
            "http://192.168.250.81:8000/api/log/cctv/register", data={
                "photo_id": name.split("-")[0],
                "status": "CAM1",
            })
        print(response.status_code)
        if response.status_code == 200:
            print(response.text)
        else:
            print("Server is down")

        last_response_time = datetime.now()

    # Display the frame
    cv2.imshow("Frame", frame1)

    # Check for key press to exit
    key = cv2.waitKey(1)
    if key == 27:
        break

# Release the video capture and close windows
cap1.release()
cv2.destroyAllWindows()
