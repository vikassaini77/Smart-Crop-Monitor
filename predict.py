from ultralytics import YOLO
from PIL import Image
import os
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from iot.email_alert import send_email_alert as trigger_alert



model_path = r"runs\detect\pest_detector14\weights\best.pt"


source = "test.jpg" 


# --- 3. LOAD THE MODEL AND RUN PREDICTION ---

def run_pest_detection():
    """
    Main function to run the pest detection and trigger alerts.
    """
    # Check if the source and model exist before running
    if not os.path.exists(source):
        print(f"ERROR: Source file not found at {source}")
        return
    if not os.path.exists(model_path):
        print(f"ERROR: Model file not found at {model_path}")
        return

    print("Loading model...")
    model = YOLO(model_path)

    print(f"Running prediction on '{source}'...")
    results = model.predict(source=source, save=True) # save=True will save the result image automatically

    # --- 4. PROCESS RESULTS AND TRIGGER ALERTS ---
    print("Processing results...")
    pests_detected = []
    for r in results:
        # Check if any pests were detected
        if len(r.boxes) > 0:
            # Loop through each detected pest
            for box in r.boxes:
                # Get the class name of the detected pest
                pest_name = model.names[int(box.cls[0])]
                if pest_name not in pests_detected:
                    pests_detected.append(pest_name)

    # If any pests were found, trigger alerts
    if pests_detected:
        print(f"Pests found: {', '.join(pests_detected)}")
        
        result_image_path = os.path.join(results[0].save_dir, os.path.basename(source))

        # Trigger one alert for each unique pest type found
        for pest in pests_detected:
            
            trigger_alert(pest, result_image_path) # For dummy and device alerts
            # trigger_alert(pest, result_image_path) # For email, telegram, pushbullet
    else:
        print("No pests detected.")

    # The prediction automatically saves the image, so we don't need to do it again.
    # A window will pop up showing the result if you're on a desktop.
    print(f"Prediction complete. Results saved in '{results[0].save_dir}'")


# This makes the script runnable
if __name__ == '__main__':
    run_pest_detection()