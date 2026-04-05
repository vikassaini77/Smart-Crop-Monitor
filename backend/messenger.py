import time

def send_sms_alert(pest_name, confidence, recommendation):
    print(f"\n[TWILIO] 📱 MOCK SMS/WHATSAPP SENT:")
    print(f"       🚨 Alert: {pest_name.upper()} detected in your field (Confidence: {confidence*100:.0f}%)")
    print(f"       💡 Action: {recommendation}\n")
