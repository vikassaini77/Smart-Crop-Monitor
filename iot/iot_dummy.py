import time

def trigger_alert(pest_name):
    """
    This is a dummy function to simulate an IoT alert.
    Instead of activating a real device, it just prints a message.
    """
    print("-----------------------------------------")
    print("🚨 DUMMY ALERT! 🚨")
    print(f"Time: {time.ctime()}")
    print(f"Pest Detected: {pest_name}")
    print("Action: A real IoT device would turn on a light or buzzer now.")
    print("-----------------------------------------")

# This part allows you to test the function by itself if you want
# To test, open a terminal and run: python iot/iot_dummy.py
if __name__ == '__main__':
    print("Testing the dummy alert function...")
    trigger_alert("Japanese Beetle")
    print("Test complete.")