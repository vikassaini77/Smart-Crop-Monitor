import os
import cv2
import time
import datetime
import torch
from celery import shared_task
from ultralytics import YOLO
from backend.database import SessionLocal
from backend.models_db import Job, Result

# Load YOLO Model for the worker
model_path = os.path.join(os.path.dirname(__file__), '..', 'best.pt') if not os.path.exists('best.pt') else 'best.pt'
if not os.path.exists(model_path):
    model_path = 'yolov8n.pt' # ultimate fallback

yolo_model = YOLO(model_path)
DANGEROUS_PESTS = ["locust", "grasshopper", "armyworm", "hornworm"]

# Strict classes to filter out typical COCO false positives
INVALID_CLASSES = {"person", "car", "truck", "dog", "cat", "chair", "birds", "bird", "airplane", "bus", "train", "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench"}

def get_severity(pest_name):
    if pest_name.lower() in DANGEROUS_PESTS: return "critical"
    if pest_name not in ["None", ""]: return "medium"
    return "low"

def is_valid_detection(class_name, box, frame_shape):
    if class_name.lower() in INVALID_CLASSES:
        return False
    
    # ROI AREA FILTERING
    img_h, img_w = frame_shape[:2]
    x1, y1, x2, y2 = map(float, box.xyxy[0])
    box_area = (x2 - x1) * (y2 - y1)
    frame_area = img_h * img_w
    
    if box_area > (frame_area * 0.40):
        return False # Ignore giant bounding boxes 
    return True

@shared_task(bind=True)
def process_image_batch(self, job_id, image_paths):
    """
    Process a batch of images using YOLO native batch processing.
    """
    db = SessionLocal()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        db.close()
        return

    job.status = "processing"
    db.commit()

    try:
        BATCH_SIZE = 32 # Scalable GPU/CPU batches
        for i in range(0, len(image_paths), BATCH_SIZE):
            batch_paths = image_paths[i:i+BATCH_SIZE]
            
            # 🚀 Using higher confidence, native YOLO batching, and NMS explicitly
            results_list = yolo_model(batch_paths, verbose=False, conf=0.50, iou=0.45)
            
            for file_path, result in zip(batch_paths, results_list):
                file_name = os.path.basename(file_path)
                has_valid_detection = False
                
                if len(result.boxes) > 0:
                    for box in result.boxes:
                        cls_id = int(box.cls[0])
                        pest_name = yolo_model.names.get(cls_id, "Unknown")
                        
                        if not is_valid_detection(pest_name, box, result.orig_shape):
                            continue
                            
                        has_valid_detection = True
                        x1, y1, x2, y2 = map(float, box.xyxy[0])
                        confidence = float(box.conf[0]) * 100
                        
                        db.add(Result(
                            job_id=job.id, file_name=file_name, pest_name=pest_name,
                            confidence=confidence, severity=get_severity(pest_name),
                            box_x1=x1, box_y1=y1, box_x2=x2, box_y2=y2
                        ))

                if not has_valid_detection:
                    db.add(Result(
                        job_id=job.id, file_name=file_name, pest_name="None",
                        confidence=0.0, severity="low"
                    ))
            
            db.commit() # Commit database changes after each batch memory chunk is processed

        job.status = "completed"
    except Exception as e:
        job.status = "failed"
        print(f"Batch inference failed: {e}")
    finally:
        job.completed_at = datetime.datetime.utcnow()
        db.commit()
        db.close()

    return {"job_id": job_id, "status": job.status}

@shared_task(bind=True)
def process_video(self, job_id, video_path):
    """
    Process a video, sampling frames natively batched, applying object tracking.
    """
    db = SessionLocal()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        db.close()
        return

    job.status = "processing"
    db.commit()

    try:
        try:
            from deep_sort_realtime.deepsort_tracker import DeepSort
            tracker = DeepSort(max_age=30, n_init=3)
        except ImportError:
            tracker = None

        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = int(fps / 5) if fps > 5 else 1 # Process ~5 fps
        
        BATCH_SIZE = 16 # Group frames together for batched GPU/CPU processing
        frame_count = 0
        batch_frames = []
        batch_timestamps = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
                
            if frame_count % frame_interval == 0:
                timestamp = frame_count / fps
                batch_frames.append(frame)
                batch_timestamps.append(timestamp)
                
                if len(batch_frames) >= BATCH_SIZE:
                    _process_video_batch(db, job.id, batch_frames, batch_timestamps, tracker)
                    batch_frames = []
                    batch_timestamps = []
                    
            frame_count += 1
            
        # Flush the final remainder batch
        if len(batch_frames) > 0:
            _process_video_batch(db, job.id, batch_frames, batch_timestamps, tracker)

        cap.release()
        job.status = "completed"
    except Exception as e:
        job.status = "failed"
        print(f"Video inference failed: {e}")
    finally:
        job.completed_at = datetime.datetime.utcnow()
        db.commit()
        db.close()

    return {"job_id": job_id, "status": job.status}

def _process_video_batch(db, job_id, frames, timestamps, tracker):
    """Helper purely for running batched inferences on a chunk of video frames sequentially via tracker."""
    # 🚀 The model prediction treats the list of grouped numpy frames as ONE batched execution!
    results_list = yolo_model(frames, verbose=False, conf=0.50, iou=0.45)
    
    for i, (frame, result, timestamp) in enumerate(zip(frames, results_list, timestamps)):
        bbs = []
        
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            name = yolo_model.names.get(cls_id, "Unknown")
            
            if not is_valid_detection(name, box, frame.shape):
                continue

            w, h = x2 - x1, y2 - y1
            bbs.append(([x1, y1, w, h], conf, name))
        
        # We must update tracker sequentially frame-by-frame, even though inference was batched
        if tracker and len(bbs) > 0:
            tracks = tracker.update_tracks(bbs, frame=frame)
            for track in tracks:
                if not track.is_confirmed() or track.time_since_update > 1: continue
                
                ltrb = track.to_ltrb() 
                x1, y1, x2, y2 = map(float, ltrb)
                pest_class = track.get_det_class()
                
                db.add(Result(
                    job_id=job_id, frame_timestamp=timestamp, 
                    pest_name=f"{pest_class} (Track {track.track_id})", confidence=100.0, 
                    severity=get_severity(pest_class), box_x1=x1, box_y1=y1, box_x2=x2, box_y2=y2
                ))
        else:
            # If no tracking available / installed
            for box in result.boxes:
                x1, y1, x2, y2 = map(float, box.xyxy[0])
                conf = float(box.conf[0]) * 100
                cls_id = int(box.cls[0])
                pest_class = yolo_model.names.get(cls_id, "Unknown")
                
                if not is_valid_detection(pest_class, box, frame.shape): continue

                db.add(Result(
                    job_id=job_id, frame_timestamp=timestamp, pest_name=pest_class,
                    confidence=conf, severity=get_severity(pest_class),
                    box_x1=x1, box_y1=y1, box_x2=x2, box_y2=y2
                ))
                
    db.commit()
