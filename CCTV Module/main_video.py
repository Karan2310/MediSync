import cv2
from simple_facerec import SimpleFacerec
from datetime import datetime, timedelta
import face_recognition
import requests
import os

# URLs of known faces
result = [
    "https://storage.googleapis.com/medisync-e2ef1.appspot.com/Dr.%20Faizan%20Potrick.jpeg?GoogleAccessId=firebase-adminsdk-29jp5%40medisync-e2ef1.iam.gserviceaccount.com&Expires=16446997800&Signature=mUBNNg29BEBED6ezc%2FJ7l3Gb2U%2BiE3ftENpEuJzvXoyCT%2FM09k6bNmZtrkDoyfazb1gSjE3XOuTdVvhBJJba6QzCSrJwVtuCRJGpCvEXulavB%2BqogWAX7aAnwEvj3Pk9BXUjUqp0OTLL1hc2ykSZz%2FDxTLsFgxNxxSqKwqZkCzYzz%2BIwF%2FScUuarQnzh2d07uP5ajFTOvbzbeNXNQxn5EX5S0CX%2BFsBLsWvUSc%2BvWwDfwX0caro%2FUGu6dHNfmRrZ8NcLW8WPMGFy%2BiDgXow2nkVV2XduArT4SUMetsgU8S2Pjh9xuDiFiFo42E9WW4L%2F%2BSokZdAWXBT5%2FSp%2BVpZDIw%3D%3D",
    "https://storage.googleapis.com/medisync-e2ef1.appspot.com/Dr.%20Karandeep%20Singh%20Sandhu.jpeg?GoogleAccessId=firebase-adminsdk-29jp5%40medisync-e2ef1.iam.gserviceaccount.com&Expires=16446997800&Signature=eLG9rbfq50WqRuCeIIDPedkjt6kkmsXXslfP1B%2BFFoSx0U6RDwgEdv8stPf71DhnZxLflNE80VUs1Fh2WNHdoX%2F9q9pgaBzVanBGnPt6q6fhtSRTtNqv7TMrs11kHWObSgqJHUOAhVqXjqmmtzT%2FZMbrh3UpLQIUqgYWy8KJW8O7vXpcUqJyCWilZWsgMT933ySg1BioxpkfgZwVv1meBzYdeolQwieCGkG0r%2F%2FsUmWUkGaIAA0lELDOwE%2FW3gGoAG9H3wWNIJvirnVdW7i7JjEII%2BvzhNhr%2B0b8D%2FKJI2hcnb94HOjf6e6yYpBt4%2BdqQG3GgRHHzWb%2BpqPLA1btlw%3D%3D"
]

# Video capture from webcam
cap1 = cv2.VideoCapture(1)
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
            name = os.path.splitext(detected_name)[0]
            name = name.replace("%20", " ")
            url = detected_url

            # Draw bounding box and name on the frame
            cv2.putText(frame1, f"{name}", (x1, y1 - 10), cv2.FONT_HERSHEY_DUPLEX, 1,
                        (0, 0, 200), 2)
            cv2.rectangle(frame1, (x1, y1), (x2, y2), (0, 0, 200), 4)

    # Check if a doctor is detected and response time has elapsed
    if doctor_detected and (datetime.now() - last_response_time).total_seconds() >= 20:
        current_time = datetime.now().strftime("%H:%M:%S")
        log_message = f"{name} found in Cam1 - Time {current_time}"
        print(log_message)

        # Uncomment the following lines to enable requests
        # response = requests.post(
        #     "http://192.168.250.56:8000/api/log/cctv/register", data={
        #         "photo_url": url,
        #         "status": "CAM1",
        #     })
        # print(response.status_code)
        # if response.status_code == 200:
        #     print(response.text)
        # else:
        #     print("Server is down")

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
