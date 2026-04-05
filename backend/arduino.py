import serial
import time

class RealArduino:
    def __init__(self, port="COM3", baudrate=9600):
        self.port = port
        self.baudrate = baudrate
        self.last_signal = None
        self.connected = False
        
        print(f"[IOT] 🔌 Attempting to connect to physical Arduino on {self.port}...")
        try:
            self.board = serial.Serial(self.port, self.baudrate, timeout=1)
            time.sleep(2) # Give the Arduino 2 seconds to reset after opening serial port
            self.connected = True
            print(f"[IOT] ✅ SUCCESS: Connected to pure hardware on {self.port} at {self.baudrate} baud.")
        except Exception as e:
            print(f"[IOT] ⚠️ WARNING: Could not find physical Arduino on {self.port}.")
            print(f"[IOT] ⚠️ Ensure your Arduino is plugged in and you verify the COM port in Device Manager.")
            print(f"[IOT] ⚠️ Falling back to Mock/Simulation mode! Error: {e}")

    def send_signal(self, signal_code: str):
        if signal_code == self.last_signal:
            return  # Don't spam the same signal to the board
            
        self.last_signal = signal_code
        
        # Describe what we are trying to do
        action_map = {
            '1': "🟢 LED ON (Low Threat)",
            '2': "🔊 BUZZER ON (Medium/High Threat)",
            '3': "⚙️ MOTOR SPRAYING (Critical Threat)",
            '0': "🛑 ALL DEVICES OFF"
        }
        action_desc = action_map.get(signal_code, f"❓ Unknown signal ({signal_code})")
        
        if self.connected:
            try:
                # Write the exact byte array down the USB cable to the microcontroller
                self.board.write(signal_code.encode('utf-8'))
                print(f"\n[IOT] ⚡ PHYSICAL HARDWARE TRIGGERED: Sending '{signal_code}' -> {action_desc} ⚡")
            except Exception as e:
                print(f"\n[IOT] ❌ Failed to write to Arduino: {e}")
                self.connected = False # Connection was likely lost (unplugged)
        else:
            # We are in fallback/mock mode if no Arduino was found!
            print(f"\n[IOT] 🔌 (MOCK MODE) Signal '{signal_code}' would have fired: {action_desc}")

# Main instance used by the rest of the application
arduino = RealArduino(port="COM15")
