import requests

SUPABASE_URL = "https://ritomcgxztfqxwzjcdwj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpdG9tY2d4enRmcXh3empjZHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTkyNTcsImV4cCI6MjA4OTk5NTI1N30.HmwaupsceieXy2w-P5rfO-WFcSgeK1GtYIZ67NNhZfQ"

def log_detection(pest_name, confidence, severity, action):
    try:
        url = f"{SUPABASE_URL}/rest/v1/detections"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        payload = {
            "pest_name": pest_name,
            "disease_name": "None",
            "confidence": round(confidence * 100, 2) if confidence else None,
            "severity": severity,
            "suggested_action": action
        }
        requests.post(url, headers=headers, json=payload, timeout=2)
        print(f"[DB] ☁️ Updated Supabase 'detections' table -> {pest_name}")
    except Exception as e:
        print(f"[DB] ❌ Failed to log detection to Supabase: {e}")

def log_alert(title, message, severity):
    try:
        url = f"{SUPABASE_URL}/rest/v1/alerts"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        payload = {
            "title": title,
            "message": message,
            "severity": severity
        }
        requests.post(url, headers=headers, json=payload, timeout=2)
        print(f"[DB] ☁️ Updated Supabase 'alerts' table -> {title}")
    except Exception as e:
        print(f"[DB] ❌ Failed to log alert to Supabase: {e}")
