# in iot/iot_device.py
import time
import json

# Use a try-except block to allow this code to run on a PC without error
try:
    import RPi.GPIO as GPIO
    IS_RASPBERRY_PI = True
except (ImportError, RuntimeError):
    IS_RASPBERRY_PI = False

def trigger_device_alert(pest_name, duration_seconds=5):
    """Activates a GPIO pin on a Raspberry Pi to trigger an LED or buzzer."""
    if not IS_RASPBERRY_PI:
        print("⚠️ Not running on a Raspberry Pi. Skipping physical alert.")
        return False

    try:
        # Load config from file
        with open('config.json', 'r') as f:
            config = json.load(f)['iot_device']
        
        led_pin = config['led_pin']

        # Setup GPIO
        GPIO.setmode(GPIO.BCM)  # Use Broadcom pin numbering
        GPIO.setup(led_pin, GPIO.OUT)
        
        print(f"✅ Activating GPIO Pin {led_pin} for {duration_seconds} seconds for pest: {pest_name}")
        
        # Turn on the device
        GPIO.output(led_pin, GPIO.HIGH)
        time.sleep(duration_seconds)

        return True

    except Exception as e:
        print(f"❌ Failed to trigger device alert: {e}")
        return False
    finally:
        # This will always run, ensuring the pins are cleaned up
        if IS_RASPBERRY_PI:
            print("Cleaning up GPIO pins.")
            GPIO.cleanup()

# This block allows you to test the script directly
if __name__ == '__main__':
    if not os.path.exists('config.json'):
        print("ERROR: config.json not found. Please create it first.")
    else:
        print("Testing IoT device alert...")
        trigger_device_alert("Test Pest")