// ==========================================
// 🌿 Field Guardian AI - Hardware Controller (LED Only Mode)
// ==========================================
// This sketch listens to your laptop's USB port for physical 
// threat severity bytes ('1', '2', '3', '0') and uses a single LED 
// to indicate the threat level through different blinking patterns.

// Define physical pin connected to Arduino
const int PIN_LED = 13; // Changed to 13 as per user request

// Blinking variables
unsigned long previousMillis = 0;
long interval = 0; 
bool isBlinking = false;
int ledState = LOW;

void setup() {
  // Start USB serial connection at 9600 baud rate (Must match Python code!)
  Serial.begin(9600);
  
  // Configure pin as OUTPUT
  pinMode(PIN_LED, OUTPUT);
  
  // Make sure it's OFF on startup
  turnOffEverything();
  
  Serial.println("Arduino Ready! (LED-Only Mode) Waiting for Python signals...");
}

void loop() {
  // Check if our laptop sent any bytes down the USB cable
  if (Serial.available() > 0) {
    char incomingSignal = Serial.read();
    
    // Ignore newlines/carriage returns
    if (incomingSignal != '\n' && incomingSignal != '\r') {
      
      switch (incomingSignal) {
        case '1':
          // Low Threat -> Slow Blink
          isBlinking = true;
          interval = 1000; // 1 second blink
          Serial.println("TRIGGERED: Low Threat (Slow Blink)");
          break;
          
        case '2':
          // High Threat -> Fast Blink
          isBlinking = true;
          interval = 200; // Fast blink
          Serial.println("TRIGGERED: High Threat (Fast Blink)");
          break;
          
        case '3':
          // Critical Threat -> Solid ON
          isBlinking = false;
          digitalWrite(PIN_LED, HIGH);
          Serial.println("TRIGGERED: Critical Threat (Solid ON)");
          break;
          
        case '0':
          // Screen is Clear -> Turn OFF
          turnOffEverything();
          Serial.println("TRIGGERED: ALL_OFF");
          break;
          
        default:
          break;
      }
    }
  }

  // Handle blinking state independently
  if (isBlinking) {
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= interval) {
      previousMillis = currentMillis;
      
      // Toggle the led state
      if (ledState == LOW) {
        ledState = HIGH;
      } else {
        ledState = LOW;
      }
      digitalWrite(PIN_LED, ledState);
    }
  }
}

// Helper function to silence all alerts
void turnOffEverything() {
  isBlinking = false;
  ledState = LOW;
  digitalWrite(PIN_LED, LOW);
}
