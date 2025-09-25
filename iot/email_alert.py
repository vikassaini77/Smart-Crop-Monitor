# in iot/email_alert.py
import smtplib
import json
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import time

def send_email_alert(pest_name, image_path):
    """Sends an email with the pest detection image attached."""
    try:
        # Load credentials from config file
        with open('config.json', 'r') as f:
            config = json.load(f)['email']

        sender_email = config['sender_email']
        sender_password = config['sender_password']
        receiver_email = config['receiver_email']

        # Create the email
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = f"Pest Detection Alert: {pest_name} Found!"

        # Email body
        body = f"A '{pest_name}' was detected at {time.ctime()}."
        msg.attach(MIMEText(body, 'plain'))

        # Attach the image
        with open(image_path, 'rb') as fp:
            img = MIMEImage(fp.read())
            img.add_header('Content-Disposition', 'attachment', filename=os.path.basename(image_path))
            msg.attach(img)

        # Connect to Gmail's SMTP server and send the email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        
        print(f"✅ Email alert sent successfully to {receiver_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email alert: {e}")
        return False

# This block allows you to test the script directly
if __name__ == '__main__':
    # Create a dummy image and config file for testing
    import os
    if not os.path.exists('test.jpg'):
        from PIL import Image
        Image.new('RGB', (100, 100), color = 'red').save('test.jpg')
    if not os.path.exists('config.json'):
         print("ERROR: config.json not found. Please create it first.")
    else:
        print("Testing email alert...")
        send_email_alert("Test Pest", "test.jpg")