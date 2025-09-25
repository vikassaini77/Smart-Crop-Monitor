from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import uvicorn
import os
from ultralytics import YOLO
from datetime import datetime
import pandas as pd
from fpdf import FPDF
# --- 1. IMPORT CORS MIDDLEWARE ---
from fastapi.middleware.cors import CORSMiddleware


# Load YOLOv8 model
MODEL_PATH = "best.pt"
model = YOLO(MODEL_PATH)

# Make sure results folder exists
os.makedirs("results", exist_ok=True)

# Create app
app = FastAPI(title="Pest Detection API")


# --- 2. ADD THE CORS MIDDLEWARE ---
# This allows your frontend at localhost:3000 to talk to your backend at localhost:8000
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Store logs in memory
detections_log = []

# --- (The rest of your code stays exactly the same) ---

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    # ... (your predict logic) ...
    contents = await file.read()
    save_path = f"results/{file.filename}"
    with open(save_path, "wb") as f:
        f.write(contents)

    results = model(save_path)

    labels = []
    for r in results:
        for c in r.boxes.cls.cpu().numpy():
            labels.append(model.names[int(c)])

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    detections_log.append({"time": timestamp, "file": file.filename, "detections": labels})

    return JSONResponse({
        "file": file.filename,
        "detections": labels,
        "time": timestamp
    })

# ... (your /logs/ and /export/ routes) ...
@app.get("/logs/")
async def get_logs():
    return detections_log

@app.get("/export/csv/")
async def export_csv():
    if not detections_log:
        return {"message": "No logs available"}
    df = pd.DataFrame(detections_log)
    csv_path = "results/detections.csv"
    df.to_csv(csv_path, index=False)
    return {"csv_file": csv_path}

@app.get("/export/pdf/")
async def export_pdf():
    if not detections_log:
        return {"message": "No logs available"}
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Pest Detection Report", ln=True, align="C")
    for log in detections_log:
        line = f"{log['time']} - {log['file']} - {','.join(log['detections'])}"
        pdf.multi_cell(0, 10, txt=line)
    pdf_path = "results/detections.pdf"
    pdf.output(pdf_path)
    return {"pdf_file": pdf_path}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)