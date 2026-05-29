import requests

SUPABASE_URL = "https://aqrjjknovlqvypsrwqca.supabase.co"
SUPABASE_KEY = "sb_publishable_ZzwaTExDXIcw0c5WBmvJFQ_T6ztwGNr"

def log_detection(pest_name, confidence, severity, action, image_url=None):
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
        if image_url:
            payload["image_url"] = image_url

        response = requests.post(url, headers=headers, json=payload, timeout=2)
        response.raise_for_status() # Raise exception if HTTP error
        print(f"[DB] Updated Supabase 'detections' table -> {pest_name}")
    except Exception as e:
        print(f"[DB] Failed to log detection to Supabase: {e}")

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
        response = requests.post(url, headers=headers, json=payload, timeout=2)
        response.raise_for_status() # Raise exception if HTTP error
        print(f"[DB] Updated Supabase 'alerts' table -> {title}")
    except Exception as e:
        print(f"[DB] Failed to log alert to Supabase: {e}")
