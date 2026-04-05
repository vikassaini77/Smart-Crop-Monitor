<div align="center">

# 🌿 Field Guardian AI: Smart Crop Monitor
**Next-Generation Agricultural Security utilizing Local Edge Tracking, Cloud Intelligence, and IoT**

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-ultralytics-yellow)](https://github.com/ultralytics/ultralytics)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*Protect your yields. Automate your awareness. Power your farm with AI.*

</div>

<br />

## 📌 Project Overview

**Problem Statement:**  
Crop damage from pest infestations costs the global agricultural industry billions annually. Traditional pest monitoring is manual, slow, and prone to error—often allowing infestations to spread rapidly before they are detected. 

**Solution:**  
**Field Guardian AI** is an end-to-end, real-time pest detection and intervention platform. It merges **Edge Computing (YOLOv8)** for high-speed local inference with **Cloud Intelligence** for batch analytics. Moving beyond simple detection, the system takes physical action via **IoT-integrated Arduino microcontrollers** to deter pests in the field, while providing farmers with an interactive **Gemini-powered AI Chatbot** for instant, actionable agricultural advice.

**Target Users:** Farmers, Agritech Researchers, Agribusinesses, and IoT Developers.

---

## ⚙️ Tech Stack

### Frontend
* **Core:** React 18, TypeScript, Vite
* **Styling & UI:** Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
* **Data Vis:** Recharts

### Backend
* **Core API:** FastAPI, Flask, Python 3.10+
* **Asynchronous Workers:** Celery, Redis
* **Hardware Integration:** PySerial

### ML / AI
* **Vision Model:** YOLOv8 (Ultralytics), PyTorch, OpenCV
* **LLM Integration:** Google Gemini API (for AI Agronomist Chatbot)

### Deployment & Infra
* **Containerization:** Docker, Docker Compose
* **IoT Hardware:** Arduino Uno/Mega, USB Webcams

---

## 🎯 Key Features

* 🚀 **Real-Time Edge Inference:** Live 30FPS spatial tracking utilizing local hardware, completely offline-capable.
* ☁️ **Scalable Batch Processing:** Cloud-queued batch mode using Docker, Celery, and Redis to process massive datasets and heavy video files without blocking the main thread.
* 🤖 **Interactive AI Agronomist:** Integrated Gemini-powered AI chatbot analyzes detected pests and provides tailored, actionable farming advice directly in the dashboard.
* 🛡️ **Smart ROI Filtering:** Intelligent spatial logic automatically ignores massive false-positive bounding boxes resulting from wildly zoomed-in or blurry frames.
* ⚡ **Automated IoT Hardware Execution:** Interfaces with Arduino microcontrollers in real-time, sending UART digital signals (`0`: Standby, `1`: LED Alerts, `2`: Buzzer Alarms, `3`: Motor Systems) based on pest severity.
* 📊 **Cinematic Dashboard:** A highly interactive, responsive React dashboard featuring real-time metric updates, data visualization, and seamless hardware controls.

---

## 📊 System Architecture

### High-Level Data Flow

1. **Input Generation:** Video frames are captured via local webcams or huge datasets are uploaded via the frontend.
2. **Inference Engine:** Images are processed by the custom YOLOv8 model. **Smart ROI Filtering** handles spatial anomalies.
3. **Decision Matrix:** Depending on bounding box confidence and pest classification, the backend calculates a "Severity Score".
4. **IoT Execution:** Via `pyserial`, the severity score is transmitted to an Arduino to trigger physical field responses.
5. **AI Augmentation:** Analyzed data is piped to the Gemini API, generating expert mitigation strategies.
6. **Client Presentation:** The frontend receives the finalized payload via API polling, updating the graphical dashboard seamlessly.

### Dual-Mode Deployment

* **Edge Mode (Local Hardware):** FastAPI directly hooks into local webcams and serial ports. Optimized for zero-latency.
* **Batch Mode (Cloud Queueing):** Utilizes Dockerized workers. The API places jobs onto a Redis queue, which Celery workers consume to run inference iteratively. 

---

## 📁 Project Structure

```text
pest-detection-starter/
├── backend/                  # Python Backend Core
│   ├── app.py                # Main backend API entrypoint
│   ├── arduino.py            # IoT hardware control via pyserial
│   ├── celery_app.py         # Asynchronous worker setup
│   ├── predict.py            # YOLOv8 inference wrapper
│   └── main.py               # Application server runner
├── field-guardian-ai-main/   # React / Vite / TypeScript Frontend
│   ├── src/                  # React source code (components, hooks, pages)
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Styling architecture
├── arduino_sketch/           # C++ code for Arduino microcontrollers
├── models.txt                # ML Model tracking / metadata
├── requirements.txt          # Python dependencies
├── run_all.bat               # Automated startup script for Windows
└── docker-compose.yml        # Docker orchestration for Batch Mode
```

---

## 🚀 Installation & Setup

**Prerequisites:** Python 3.9+, Node.js & npm, and Docker Desktop (for Batch Mode).

### MODE 1: Local Edge Mode (Camera & IoT) 📷
*Use this mode to access physical webcams and plug in physical Arduinos via USB. (Docker isolates USB ports by default).*

**Automated Windows Setup:**
1. Open PowerShell and navigate to the root directory.
2. Run the startup script:
```powershell
.\run_all.bat
```
*(This automatically provisions your virtual environment, installs dependencies, and boots the frontend and backend).*

<detials>
<summary><b>Manual Startup Instructions</b></summary>

**Backend:**
```bash
python -m venv .venv
source .venv/bin/activate  # (or .venv\Scripts\Activate.ps1 on Windows)
pip install -r requirements.txt
python -m backend.main
```

**Frontend:**
```bash
cd field-guardian-ai-main
npm install
npm run dev
```

</detials>

### MODE 2: Scalable Batch Mode (Cloud Queueing) ☁️
*Use this mode to test uploading massive batches of images or heavy videos. It spins up Redis queues and Celery background workers.*

1. Open a terminal in the root directory.
2. Boot up the architecture (API, Worker, Redis):
```bash
docker-compose up --build
```
3. Start the frontend separately in another terminal:
```bash
cd field-guardian-ai-main
npm run dev
```

---

## ▶️ Usage & Endpoints

1. Navigate to `http://localhost:5173`.
2. **Dashboard Overview:** View live system status, recent detections, and hardware connectivity.
3. **Pest Detection Tab:** Choose between **Live Camera** (Edge Mode) or **Batch Upload** (Cloud Mode).
4. **AI Agronomist:** Click on any previously detected pest to instantiate a chat utilizing the Gemini LLM for agricultural advice.

### System Fallback Note
If the backend is started in Local Mode without an Arduino connected to the specified COM port (e.g., `COM3`), it will print:
`[IOT] ⚠️ WARNING: Could not find physical Arduino.`
The backend will gracefully fall back to **Simulation Mode** to prevent crashing.

---

## 📸 Screenshots & Demo

*(Add high-quality screenshots or gifs of the dashboard, detection overlay, and AI chatbot here).*

![Dashboard Preview](https://via.placeholder.com/1000x500?text=Cinematic+Dashboard+Preview)
![Real-Time Detection](https://via.placeholder.com/1000x500?text=Real-Time+YOLOv8+Detection)

---

## 📈 System Performance & Results

* **Inference Speed:** Configured to push 30+ FPS locally on modern hardware leveraging targeted YOLOv8 custom weights.
* **Accuracy:** Employs advanced Non-Maximum Suppression (NMS) and custom ROI filtering, significantly dropping false-positive rates on complex or blurry agricultural backgrounds.
* **Real-World Impact:** Minimizes pesticide overhead by allowing targeted, responsive treatment rather than preemptive blind spraying.

---

## 🔒 Security & Scalability

* **Horizontal Scaling:** The Celery-based worker architecture allows for dropping in multiple inference nodes that consume from the same Redis queue.
* **Thread Safety:** The backend processes massive video rendering chunks asynchronously, keeping the REST API entirely responsive for the user.

---

## 🛣️ Roadmap

- [ ] **Multi-Camera Orchestration:** Support grid-based RTMP IP camera streams.
- [ ] **LoRaWAN Integration:** Replace short-range serial communication with LoRa for expansive field coverage.
- [ ] **TensorRT Optimization:** Implement ONNX / TensorRT export for faster edge inferencing.
- [ ] **Advanced Analytics:** Aggregate seasonal pest trends directly into the PostgreSQL database.

---

## 🤝 Contribution Guidelines

We welcome pull requests! For major changes, please open an issue first to discuss the proposed adjustments.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Maintainer

**Your Name**  
*Senior Software Engineer & AI Researcher*  
[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat&logo=github)](https://github.com/) 
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/)
