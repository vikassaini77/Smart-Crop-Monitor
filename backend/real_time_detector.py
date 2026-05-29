import cv2
import time
import asyncio
import threading
import json
import base64
import os
from fastapi import Request
from ultralytics import YOLO

from backend.arduino import arduino
from backend.messenger import send_sms_alert
from backend.email_alert import send_email_alert
from backend.db_logger import log_detection, log_alert

# ==========================================
# 🧠 LOCAL AI TRACKING SETUP (100% OFFLINE)
# ==========================================

# We load the fast, physical YOLO model exclusively
model_path = os.path.join(os.path.dirname(__file__), '..', 'best.pt') if not os.path.exists('best.pt') else 'best.pt'
yolo_model = YOLO(model_path) if os.path.exists(model_path) else YOLO('yolov8n.pt') 

DANGEROUS_PESTS = ["locust", "grasshopper", "armyworm", "hornworm", "caterpillar", "caterpillars"]

# Thread Safety & Brain Sync
latest_diagnosis = {"pest": "Scanning Target...", "confidence": 0, "severity": "low"}
last_detected_pest = None
fallback_yolo_name = "Unknown"

async def generate_frames_async(request: Request):
    global latest_diagnosis, last_detected_pest, fallback_yolo_name
    
    cap = cv2.VideoCapture(0)
    
    pest_visible_since = None
    last_seen_time = 0
    last_eval_time = 0
    EVAL_COOLDOWN = 8 # Wait 8 seconds before logging
    
    print("\nStarting 100% Offline Local AI Tracking System...")
    
    if not cap.isOpened():
        return
        
    try:
        while True:
            if await request.is_disconnected():
                break
                
            ret, frame = cap.read()
            if not ret: break
            
            # --- 🚀 FAST LOOP: Run YOLO strictly for Box Tracking coordinates ---
            # Increased confidence to 0.60 and added explicit NMS (iou) to reduce false positives!
            results = yolo_model.predict(frame, verbose=False, conf=0.60, iou=0.45)
            
            has_bounding_box = False
            top_confidence = 0.0
            
            if len(results[0].boxes) > 0:
                for box in results[0].boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cls_id = int(box.cls[0])
                    class_name_str = yolo_model.names.get(cls_id, "Unknown").lower()
                    
                    # 🛡️ 1. CLASS FILTERING
                    # Reject COCO "person" or unrelated objects if running on fallback yolov8n.pt
                    if class_name_str in ["person", "car", "truck", "dog", "cat", "chair"]:
                        continue # Explicitly ignore human faces and background objects
                        
                    # 🛡️ 2. ROI AREA FILTERING
                    # Pests shouldn't take up 40%+ of the framing. If so, it's a false positive object too close to the lens.
                    box_area = (x2 - x1) * (y2 - y1)
                    frame_area = frame.shape[0] * frame.shape[1]
                    if box_area > (frame_area * 0.40):
                        print(f"Ignored massive object ({class_name_str}) taking up {int((box_area/frame_area)*100)}% of frame")
                        
                        # ADVANCED: False Positive Logging
                        fp_dir = os.path.join(os.path.dirname(__file__), "..", "false_positives")
                        os.makedirs(fp_dir, exist_ok=True)
                        cv2.imwrite(os.path.join(fp_dir, f"FP_{class_name_str}_{int(time.time())}.jpg"), frame)
                        continue 

                    has_bounding_box = True
                    fallback_yolo_name = yolo_model.names[cls_id] if cls_id in yolo_model.names else "Unknown"
                    top_confidence = float(box.conf[0])
                    
                    # 🔴 Draw the requested RED Target Area
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                    
                    # 👑 Overlay Local AI text right above the Red Box!
                    display_text = f"{fallback_yolo_name.title()} ({int(top_confidence*100)}%)" 
                    
                    # Target Color
                    color = (0, 255, 0)
                    if fallback_yolo_name.lower() in DANGEROUS_PESTS: color = (0, 0, 255)
                    elif fallback_yolo_name != "Unknown": color = (0, 165, 255)
                    
                    cv2.putText(frame, display_text, (x1, max(20, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            
            # --- HARDWARE ACTION (Runs instantly every frame) ---
            if not has_bounding_box:
                arduino.send_signal('0')
            else:
                best_pest = fallback_yolo_name.title()
                severity = "low"
                MEDIUM_PESTS = ["snail", "snails", "ant", "ants", "slug", "slugs"]
                
                if best_pest.lower() in DANGEROUS_PESTS: 
                    severity = "critical"
                elif best_pest.lower() in MEDIUM_PESTS: 
                    severity = "medium"
                elif best_pest != "Unknown": 
                    severity = "low"
                    
                if best_pest == "None" or best_pest == "Unknown":
                    arduino.send_signal('0')
                else:
                    if severity == "critical": arduino.send_signal('3')
                    elif severity in ["high", "medium"]: arduino.send_signal('2')
                    else: arduino.send_signal('1')

            # --- HEAVY ACTIONS: DB + Emails (Runs only after sustained detection) ---
            current_time = time.time()
            if has_bounding_box:
                last_seen_time = current_time
                if pest_visible_since is None:
                    pest_visible_since = current_time
                
                if (current_time - pest_visible_since >= EVAL_COOLDOWN) and (current_time - last_eval_time >= EVAL_COOLDOWN):
                    last_eval_time = current_time
                    
                    print(f"\n[LOCAL AI] 🎯 YOLO Spotted: {fallback_yolo_name} ({int(top_confidence*100)}%) sustained for 8s")
                    
                    best_pest = fallback_yolo_name.title()
                    severity = "low"
                    MEDIUM_PESTS = ["snail", "snails", "ant", "ants", "slug", "slugs"]
                    
                    if best_pest.lower() in DANGEROUS_PESTS: 
                        severity = "critical"
                    elif best_pest.lower() in MEDIUM_PESTS: 
                        severity = "medium"
                    elif best_pest != "Unknown": 
                        severity = "low"
                    
                    latest_diagnosis = {"pest": best_pest, "confidence": top_confidence, "severity": severity}
                    
                    if best_pest != "None" and best_pest != "Unknown":
                        if best_pest != last_detected_pest:
                            # 1. Save frame for history photo
                            filename = f"detect_{int(current_time)}.jpg"
                            static_dir = os.path.join(os.path.dirname(__file__), "static")
                            os.makedirs(static_dir, exist_ok=True)
                            save_path = os.path.join(static_dir, filename)
                            cv2.imwrite(save_path, frame)
                            
                            # Construct public URL based on backend running on localhost:8000
                            image_url = f"http://localhost:8000/static/{filename}"
                            
                            # 2. Get richer context from pest_info.json
                            pest_info_path = os.path.join(os.path.dirname(__file__), 'pest_info.json')
                            pest_data = {}
                            try:
                                with open(pest_info_path, 'r') as f:
                                    all_info = json.load(f)
                                    # Try to find a case-insensitive match
                                    for k, v in all_info.items():
                                        if k.lower() == best_pest.lower() or k.lower() == best_pest.lower() + "s":
                                            pest_data = v
                                            break
                            except Exception:
                                pass
                                
                            desc = pest_data.get("description", f"AI detected {best_pest} on your crop.")
                            remedy = pest_data.get("organic_remedy", "Inspect crop manually for physical removal.")
                            
                            action_taken = f"📝 **Note:** {desc}\n\n🛡️ **Prescription:** {remedy}"
                            
                            if severity in ["high", "critical"] and top_confidence > 0.60:
                                log_alert(f"HIGH ALERT: {best_pest}", "Triggered by local YOLO model", severity)
                                send_email_alert(best_pest, top_confidence, severity, remedy)
                                
                            log_detection(best_pest, top_confidence, severity, action_taken, image_url)
                            last_detected_pest = best_pest
            else:
                # If we haven't seen the pest for more than 2 seconds, reset the continuous timer
                if pest_visible_since is not None and (current_time - last_seen_time > 2.0):
                    pest_visible_since = None
            
            # Stream out to browser
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret: continue
            
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            await asyncio.sleep(0.01) 
            
    finally:
        arduino.send_signal('0')
        cap.release()