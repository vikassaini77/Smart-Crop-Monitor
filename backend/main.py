from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
import json
from ultralytics import YOLO
from PIL import Image

# --- CONFIGURATION ---
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)
MODEL_PATH = "best.pt"
PEST_INFO_PATH = "pest_info.json"

# --- MODEL & DATA LOADING ---
try:
    model = YOLO(MODEL_PATH)
    print("✅ Model loaded successfully.")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

try:
    with open(PEST_INFO_PATH, 'r') as f:
        pest_info = json.load(f)
    print("✅ Pest info loaded successfully.")
except Exception as e:
    print(f"❌ Error loading pest_info.json: {e}")
    pest_info = {}

# --- FASTAPI APP INITIALIZATION ---
app = FastAPI(title="Pest Detection API")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API ENDPOINTS ---
@app.post("/predict/")
async def predict(request: Request, file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model is not loaded.")

    filename = f"{uuid.uuid4()}_{file.filename}"
    save_path = os.path.join(STATIC_DIR, filename)
    
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())

    results = model.predict(save_path, verbose=False)
    result = results[0]
    
    # --- THIS IS THE FIX ---
    
    # 1. Get detected pest names
    detected_pests = []
    if result.boxes:
        for box in result.boxes:
            class_id = int(box.cls[0])
            pest_name = model.names[class_id]
            if pest_name not in detected_pests:
                detected_pests.append(pest_name)
    
    result_text = ", ".join(detected_pests) if detected_pests else "No pests detected."
    
    # 2. Look up the full pest information and combine it
    dangers_text = "No detailed information available for this detection."
    if detected_pests:
        first_pest = detected_pests[0]
        pest_data = pest_info.get(first_pest)
        
        if pest_data:
            # Combine all the useful information into a single, formatted string
            description = pest_data.get('description', 'No description available.')
            organic = pest_data.get('organic_remedy', 'Not specified.')
            chemical = pest_data.get('chemical_remedy', 'Not specified.')
            
            dangers_text = (
                f"{description}\n\n"
                f"Organic Remedy: {organic}\n\n"
                f"Chemical Remedy: {chemical}"
            )

    # 3. Save the annotated image
    annotated_image_pil = Image.fromarray(result.plot()[..., ::-1])
    result_filename = 'result_' + filename
    result_filepath = os.path.join(STATIC_DIR, result_filename)
    annotated_image_pil.save(result_filepath)

    # 4. Construct a full URL for the image
    base_url = str(request.base_url)
    output_image_url = f"{base_url}static/{result_filename}"

    # 5. Return the complete JSON response
    return {
        "result": result_text,
        "dangers": dangers_text,
        "output_image_url": output_image_url
    }

# The main entry point to run the server
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

