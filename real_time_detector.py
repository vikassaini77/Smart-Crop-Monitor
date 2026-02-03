import cv2
from ultralytics import YOLO
import time
from iot.email_alert import send_email_alert 
model = YOLO('best.pt')
cap = cv2.VideoCapture(0) 

last_alert_time = 0
alert_cooldown_seconds = 10 # Send an alert at most once every 10 seconds

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

print("Starting real-time detection... Press 'q' to quit.")

# --- MAIN DETECTION LOOP ---
while True:
    ret, frame = cap.read()
    if not ret:
        break

    results = model.predict(frame, verbose=False, conf=0.5)
    annotated_frame = results[0].plot()

    # --- REAL-TIME ALERT LOGIC ---
    if len(results[0].boxes) > 0:
        current_time = time.time()
        # Check if the cooldown period has passed
        if current_time - last_alert_time > alert_cooldown_seconds:
            # Save the current frame as an image to attach to the email
            alert_image_path = "detected_pest.jpg"
            cv2.imwrite(alert_image_path, annotated_frame)
            
            # Get the name of the first detected pest
            pest_name = model.names[int(results[0].boxes[0].cls[0])]
            
            print(f"PEST DETECTED: {pest_name}. Sending email alert...")
            
            # --- 2. CALL THE EMAIL ALERT FUNCTION ---
            send_email_alert(pest_name, alert_image_path)
            
            # Reset the cooldown timer
            last_alert_time = current_time

    # Display the live video feed
    cv2.imshow("Real-Time Pest Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# --- CLEANUP ---
cap.release()
cv2.destroyAllWindows()
print("Program terminated.")