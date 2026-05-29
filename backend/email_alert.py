import smtplib
from email.message import EmailMessage

# ==========================================
# 🛑 CONFIGURATION REQUIRED
# ==========================================
SENDER_EMAIL = "vikassn44@gmail.com"    # e.g., "farm.monitor@gmail.com"
RECEIVER_EMAIL = "vikassn519@gmail.com"  # where you want alerts sent
APP_PASSWORD = "lyhc uwcm pdyi ijac" # Not your normal Google password!

def send_email_alert(pest_name, confidence, severity, recommendation):
    """
    Called by the backend when Gemini detects a pest!
    """
    if SENDER_EMAIL == "your-email@gmail.com":
        print(f"\n[EMAIL ALERTS] ⚠️ DETECTED {pest_name.upper()}!")
        print("[EMAIL ALERTS] ❌ Email skipped because SENDER_EMAIL is just the placeholder!")
        print("[EMAIL ALERTS] Please update backend/email_alert.py with real credentials.\n")
        return
        
    try:
        msg = EmailMessage()
        confidence_percent = round(confidence * 100) if confidence else 95
        msg['Subject'] = f"🚨 FARM ALERT: {severity.upper()} Risk - {pest_name.title()} Detected!"
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECEIVER_EMAIL
        
        content = f"""
        Smart Crop Monitor Automated Alert
        ==================================
        
        Warning! Your real-time camera just positively identified a potential threat.
        
        Pest Detected: {pest_name.title()}
        Severity: {severity.upper()}
        AI Confidence: {confidence_percent}%
        
        AI Recommended Action: 
        {recommendation}
        
        Open your web dashboard for more details!
        """
        msg.set_content(content)
        
        # Connect to Gmail SMTP Server securely
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(SENDER_EMAIL, APP_PASSWORD)
            smtp.send_message(msg)
            
        print(f"\n[EMAIL ALERTS] 📧 Real email successfully deposited to {RECEIVER_EMAIL}!\n")
    except Exception as e:
        print(f"\n[EMAIL ALERTS] ❌ Error trying to send email via Google SMTP: {e}\n")
