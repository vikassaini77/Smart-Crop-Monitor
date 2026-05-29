from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends, BackgroundTasks, Security
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from starlette.status import HTTP_403_FORBIDDEN
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
import json
import shutil
from typing import List, Optional
from PIL import Image
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
import os

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)


# Backend internal imports
from backend.real_time_detector import generate_frames_async

# Dynamic Imports for Scalable Architecture Offline Support
try:
    from backend.database import engine, Base, get_db
    from sqlalchemy.orm import Session
    from backend.models_db import Job, Result
    from backend.worker import process_image_batch, process_video
    SCALABLE_ENABLED = True
except ImportError as e:
    print(f"⚠️ Scalable architecture dependencies missing ({e}). Advanced batch endpoints disabled.")
    SCALABLE_ENABLED = False
    Session = type("Session", (), {"execute": lambda self, x: None}) # Dummy typing
    def get_db(): yield None

# --- CONFIGURATION ---
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)

API_KEY_NAME = "X-API-Key"
API_KEY = os.getenv("API_KEY", "smartcrop2026")
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def verify_security(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Invalid API Key")
    return api_key

# --- MODEL & DATA LOADING ---
print("✅ Local YOLO Model configuration enabled.")

# --- FASTAPI APP INITIALIZATION ---
if SCALABLE_ENABLED:
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pest Detection API")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/video")
async def video_feed(request: Request):
    return StreamingResponse(
        generate_frames_async(request),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

origins = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8081", "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API ENDPOINTS ---
@app.get("/api/iot_status")
def get_iot_status():
    from backend.arduino import arduino
    signal = getattr(arduino, "last_signal", None)
    
    state_map = {
        '1': {"led": True, "buzzer": False, "motor": False, "status": "Basic Alert"},
        '2': {"led": True, "buzzer": True, "motor": False, "status": "Strong Alert"},
        '3': {"led": True, "buzzer": True, "motor": True, "status": "Emergency Spraying"},
        '0': {"led": False, "buzzer": False, "motor": False, "status": "Standby"}
    }
    return state_map.get(signal, state_map['0'])

@app.post("/predict/")
async def predict(request: Request, file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}_{file.filename}"
    save_path = os.path.join(STATIC_DIR, filename)
    
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    # --- LOCAL YOLO AI INFERENCE ---
    try:
        from backend.real_time_detector import yolo_model, DANGEROUS_PESTS
        import cv2
        
        frame = cv2.imread(save_path)
        # Using the reliable standard confidence threshold
        results = yolo_model.predict(frame, verbose=False, conf=0.25) 
        
        pest_name = "None"
        confidence = 0.0
        
        if len(results[0].boxes) > 0:
            best_box = max(results[0].boxes, key=lambda b: float(b.conf[0]))
            cls_id = int(best_box.cls[0])
            confidence = float(best_box.conf[0]) * 100
            pest_name = yolo_model.names.get(cls_id, "Unknown")
            
            # Additional class filter sanity check
            if pest_name.lower() in ["person", "car", "dog", "cat"]:
                pest_name = "None"
                confidence = 0.0
        
        severity = "low"
        if pest_name.lower() in DANGEROUS_PESTS:
            severity = "critical"
        elif pest_name != "None":
            severity = "medium"
            
        is_healthy = pest_name == "None"
        
        base_url = str(request.base_url)
        output_image_url = f"{base_url}static/{filename}"
        
        desc = "Plant looks healthy." if is_healthy else f"Detected {pest_name} on the crop using custom YOLO model."
        action = "No action required." if is_healthy else f"Consider targeted pesticide or physical removal for {pest_name}."
        
        return {
            "pest_name": pest_name.title(),
            "disease_name": "None",
            "confidence": round(confidence, 1),
            "severity": severity,
            "suggested_action": action,
            "description": desc,
            "is_healthy": is_healthy,
            "output_image_url": output_image_url
        }
    except Exception as e:
        print(f"YOLO Inference Error: {e}")
        raise HTTPException(status_code=500, detail=f"Local YOLO failed: {str(e)}")

# --- BATCH / SCALABLE ENDPOINTS ---

@app.post("/upload-batch")
async def upload_batch(files: List[UploadFile] = File(...), db: Session = Depends(get_db), api_key: str = Depends(verify_security)):
    """
    Accepts up to 1000 images, saves them, pushes task to job queue, and returns job_id immediately.
    """
    if not SCALABLE_ENABLED:
        raise HTTPException(status_code=501, detail="Batch scaling not installed locally.")
        
    VALID_EXTS = {".jpg", ".jpeg", ".png"}
    MAX_SIZE = 10 * 1024 * 1024 # 10MB
    for f in files:
        ext = os.path.splitext(f.filename)[1].lower()
        if ext not in VALID_EXTS:
            raise HTTPException(status_code=400, detail=f"Invalid image extension: {ext}")
        f.file.seek(0, 2)
        if f.file.tell() > MAX_SIZE:
            raise HTTPException(status_code=400, detail=f"File {f.filename} exceeds 10MB limit")
        f.file.seek(0)
        
    job_id = str(uuid.uuid4())
    job = Job(id=job_id, job_type="image_batch", status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)

    # Save files
    saved_paths = []
    job_dir = os.path.join(STATIC_DIR, "jobs", job_id)
    os.makedirs(job_dir, exist_ok=True)
    
    for file in files:
        file_path = os.path.join(job_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_paths.append(file_path)

    # Push task to Celery Queue
    process_image_batch.delay(job_id, saved_paths)
    
    return {"job_id": job_id, "status": "pending", "message": f"Successfully queued {len(files)} images for processing."}

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db), api_key: str = Depends(verify_security)):
    """
    Accepts video, saves it safely, and pushes video processing task to Celery queue.
    """
    if not SCALABLE_ENABLED:
        raise HTTPException(status_code=501, detail="Video batch processing not installed.")

    VALID_EXTS = {".mp4", ".mov", ".avi"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in VALID_EXTS:
        raise HTTPException(status_code=400, detail=f"Invalid video extension: {ext}")
        
    file.file.seek(0, 2)
    if file.file.tell() > 100 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Video file exceeds 100MB limit")
    file.file.seek(0)
        
    job_id = str(uuid.uuid4())
    job = Job(id=job_id, job_type="video", status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)

    # Save file
    video_dir = os.path.join(STATIC_DIR, "jobs", job_id)
    os.makedirs(video_dir, exist_ok=True)
    file_path = os.path.join(video_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Push task to Celery Queue
    process_video.delay(job_id, file_path)
    
    return {"job_id": job_id, "status": "pending", "message": "Successfully queued video for processing."}

@app.get("/status/{job_id}")
def get_job_status(job_id: str, db: Session = Depends(get_db), api_key: str = Depends(verify_security)):
    if not SCALABLE_ENABLED:
        raise HTTPException(status_code=501, detail="Batch scaling disabled.")
        
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {"job_id": job.id, "status": job.status, "created_at": job.created_at, "completed_at": job.completed_at}

@app.get("/results/{job_id}")
def get_job_results(job_id: str, request: Request, db: Session = Depends(get_db), api_key: str = Depends(verify_security)):
    if not SCALABLE_ENABLED:
        raise HTTPException(status_code=501, detail="Batch scaling disabled.")
        
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if job.status != "completed":
        return {"job_id": job.id, "status": job.status, "message": "Results are not ready yet."}
        
    results = db.query(Result).filter(Result.job_id == job_id).all()
    
    base_url = str(request.base_url)
    
    output = []
    for r in results:
        image_url = None
        if r.file_name:
            image_url = f"{base_url}static/jobs/{job_id}/{r.file_name}"
            
        output.append({
            "pest_name": r.pest_name,
            "confidence": r.confidence,
            "severity": r.severity,
            "file_name": r.file_name,
            "frame_timestamp": r.frame_timestamp,
            "image_url": image_url,
            "bbox": {"x1": r.box_x1, "y1": r.box_y1, "x2": r.box_x2, "y2": r.box_y2}
        })
        
    return {"job_id": job.id, "status": job.status, "total_results": len(output), "data": output}

@app.get("/api/insights")
def get_pest_insights(pest_name: str, confidence: float, count: int = 1, api_key: str = Depends(verify_security)):
    """Generates rich JSON insights for a specific pest using Gemini AI."""
    try:
        from backend.ai_insights import generate_pest_insights
        insights = generate_pest_insights(pest_name, confidence, count)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WeatherRequest(BaseModel):
    lat: float
    lon: float
    location: str

@app.post("/api/weather")
def get_weather(req: WeatherRequest, api_key: str = Depends(verify_security)):
    """Mock weather data for demo purposes since Supabase Edge Function is not deployed"""
    return {
        "location_name": req.location,
        "current": {
            "temp": 24,
            "feels_like": 25,
            "humidity": 85,
            "wind_speed": 18.5,
            "description": "heavy rain",
            "icon": "🌧️",
            "uv_index": 2,
            "visibility": 4
        },
        "forecast": [
            {"day": "Mon", "temp_max": 34, "temp_min": 24, "rain_chance": 0, "icon": "☀️"},
            {"day": "Tue", "temp_max": 35, "temp_min": 25, "rain_chance": 10, "icon": "🌤️"},
            {"day": "Wed", "temp_max": 33, "temp_min": 24, "rain_chance": 40, "icon": "🌦️"},
            {"day": "Thu", "temp_max": 31, "temp_min": 23, "rain_chance": 70, "icon": "🌧️"},
            {"day": "Fri", "temp_max": 32, "temp_min": 23, "rain_chance": 20, "icon": "⛅"},
            {"day": "Sat", "temp_max": 33, "temp_min": 24, "rain_chance": 0, "icon": "☀️"},
            {"day": "Sun", "temp_max": 34, "temp_min": 25, "rain_chance": 0, "icon": "☀️"},
        ],
        "farming_alerts": [
            {
                "type": "warning",
                "title": "High Heat Index",
                "message": "Temperatures will exceed 34°C. Ensure adequate irrigation to prevent crop heat stress."
            },
            {
                "type": "info",
                "title": "Pesticide Window",
                "message": "Clear skies tomorrow morning provide an optimal 4-hour window for spraying."
            }
        ]
    }

class ChatRequest(BaseModel):
    messages: list
    detectionContext: Optional[str] = None

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest, api_key: str = Depends(verify_security)):
    try:
        from groq import Groq
    except ImportError:
        Groq = None
    
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if GROQ_API_KEY and Groq:
        client = Groq(api_key=GROQ_API_KEY)
    else:
        def fallback_stream():
            msg = "Hello! I am your local CropAI fallback assistant. Please set your `GROQ_API_KEY` environment variable in the backend to enable full AI chat capabilities! 🌱"
            yield f"data: {json.dumps({'choices': [{'delta': {'content': msg}}]})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(fallback_stream(), media_type="text/event-stream")
        
    SYSTEM_PROMPT = """You are "CropAI", a friendly and knowledgeable AI farming assistant for the Smart Crop Monitor platform. You help farmers with:
1. **Pest & Disease Identification**: Identify pests and diseases from descriptions, suggest treatments
2. **Crop Management**: Advice on fertilizers, irrigation, soil health, crop rotation
3. **Weather Advisory**: How weather conditions affect crops, when to plant/harvest
4. **Treatment Recommendations**: Organic and chemical treatment options with dosage
5. **General Farming**: Best practices, yield optimization, sustainable farming

Guidelines:
- Be warm, encouraging, and use simple language (farmers may not be tech-savvy)
- Give practical, actionable advice
- When suggesting chemicals, always mention safety precautions
- Suggest organic alternatives when possible
- If unsure, recommend consulting a local agricultural extension officer
- Keep responses concise but helpful
- Use emojis occasionally to be friendly 🌱

You have access to the user's recent detection history which may be provided in the conversation context."""

    system_content = SYSTEM_PROMPT
    if req.detectionContext:
        system_content += f"\n\nRecent detection history for this user:\n{req.detectionContext}"
        
    groq_messages = [{"role": "system", "content": system_content}]
    for m in req.messages:
        role = "assistant" if m.get("role") == "assistant" else "user"
        groq_messages.append({"role": role, "content": m.get("content", "")})
        
    def stream_generator():
        try:
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=groq_messages,
                stream=True
            )
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    data = json.dumps({"choices": [{"delta": {"content": content}}]})
                    yield f"data: {data}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            print(f"Chat error: {e}")
            error_str = str(e)
            error_msg = f"\n\n**API Error:** {error_str}"
            yield f"data: {json.dumps({'choices': [{'delta': {'content': error_msg}}]})}\n\n"
            yield "data: [DONE]\n\n"
            
    return StreamingResponse(stream_generator(), media_type="text/event-stream")

# The main entry point to run the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

