# in iot/pushbullet_alert.py
from pushbullet import Pushbullet
import json

def send_pushbullet_alert(pest_name, image_path):
    """Sends a push notification with an image to your devices via Pushbullet."""
    try:
        # Load credentials from config file
        with open('config.json', 'r') as f:
            config = json.load(f)['pushbullet']
        
        api_token = config['api_token']

        # Initialize Pushbullet
        pb = Pushbullet(api_token)

        # Upload the image file first
        with open(image_path, "rb") as f:
            file_data = pb.upload_file(f, os.path.basename(image_path))

        # Send a push notification with the uploaded file
        title = f"Pest Detection Alert: {pest_name}"
        body = f"A '{pest_name}' was detected."
        push = pb.push_file(**file_data, title=title, body=body)

        print("✅ Pushbullet alert sent successfully.")
        return True

    except Exception as e:
        print(f"❌ Failed to send Pushbullet alert: {e}")
        return False

# This block allows you to test the script directly
if __name__ == '__main__':
    # Create a dummy image and config file for testing
    import os
    if not os.path.exists('test.jpg'):
        from PIL import Image
        Image.new('RGB', (100, 100), color = 'green').save('test.jpg')
    if not os.path.exists('config.json'):
         print("ERROR: config.json not found. Please create it first.")
    else:
        print("Testing Pushbullet alert...")
        send_pushbullet_alert("Test Pest", "test.jpg")