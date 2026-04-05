// ==========================================
// 🌿 Field Guardian AI - Hardware Controller
// ==========================================
// This sketch listens to your laptop's USB port (Serial COM3) for
// physical threat severity bytes ('1', '2', '3', '0') and instantly
// turns on the matching relays/pins.

// Define physical pins connected to Arduino
const int PIN_LED = 2;        // Low Severity Indicator
const int PIN_BUZZER = 3;     // Medium/High Severity Alarm
const int PIN_MOTOR_RELAY = 4;// Critical Severity Repellent Pump

void setup() {
  // Start USB serial connection at 9600 baud rate (Must match Python code!)
  Serial.begin(9600);
  
  // Configure pins as OUTPUT
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_MOTOR_RELAY, OUTPUT);
  
  // Make sure everything is OFF on startup
  turnOffEverything();
  
  Serial.println("Arduino Ready! Waiting for Python signals...");
}

void loop() {
  // Check if our laptop sent any bytes down the USB cable
  if (Serial.available() > 0) {
    // Read the incoming byte
    char incomingSignal = Serial.read();
    
    // Ignore newlines/carriage returns that sometimes get sent automatically
    if (incomingSignal == '\n' || incomingSignal == '\r') {
      return; 
    }
    
    // Process the physical signal exactly as defined in our Python architecture
    switch (incomingSignal) {
      case '1':
        // Low Threat (e.g. Aphids) -> Turn on Warning LED
        turnOffEverything(); // Reset others
        digitalWrite(PIN_LED, HIGH);
        Serial.println("TRIGGERED: PIN_LED");
        break;
        
      case '2':
        // High Threat (e.g. Infection) -> Turn on Loud Buzzer Alarm
        turnOffEverything();
        digitalWrite(PIN_BUZZER, HIGH);
        Serial.println("TRIGGERED: PIN_BUZZER");
        break;
        
      case '3':
        // Critical Threat (e.g. Locust Swarm) -> Trigger Motor/Sprayer Relay
        turnOffEverything();
        digitalWrite(PIN_MOTOR_RELAY, HIGH);
        Serial.println("TRIGGERED: PIN_MOTOR_RELAY");
        break;
        
      case '0':
        // Screen is Clear -> Turn OFF everything
        turnOffEverything();
        Serial.println("TRIGGERED: ALL_OFF");
        break;
        
      default:
        // Unknown signal
        break;
    }
  }
}

// Helper function to silence all alerts
void turnOffEverything() {
  digitalWrite(PIN_LED, LOW);
  digitalWrite(PIN_BUZZER, LOW);
  digitalWrite(PIN_MOTOR_RELAY, LOW);
}
