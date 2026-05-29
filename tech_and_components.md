# Technologies and Components Used in Field Guardian AI

This document outlines all the software, hardware, and AI technologies used in the **Field Guardian AI: Smart Crop Monitor** project, along with the reasoning behind why each component was chosen.

## 💻 Software & Frontend Technologies

| Technology | What Form It Takes | Why We Use It |
|---|---|---|
| **React 18 & TypeScript** | UI Framework & Language | Provides a robust, component-based architecture for building a fast, interactive cinematic dashboard. TypeScript enforces type safety, preventing runtime bugs. |
| **Vite** | Build Tool | Extremely fast Hot Module Replacement (HMR) and optimized build processes compared to older bundlers like Webpack. |
| **Tailwind CSS & shadcn/ui** | Styling & UI Library | Allows for rapid styling directly in the markup while maintaining a consistent design system. `shadcn/ui` provides accessible, customizable base components (buttons, dialogs, etc.). |
| **Framer Motion & Recharts** | Animation & Charting | **Framer Motion** adds fluid micro-interactions and transitions to make the UI feel premium. **Recharts** enables data visualization for pest trends and metrics. |

## ⚙️ Backend & Architecture

| Technology | What Form It Takes | Why We Use It |
|---|---|---|
| **FastAPI (Python 3.10+)** | Primary API Server | High-performance (asynchronous) web framework. It manages routing, web sockets, and data transfer between the frontend and the AI/Hardware subsystems with blazing speed. |
| **Celery & Redis** | Asynchronous Workers & Queue | Heavy tasks (like batch processing massive video files) would freeze a standard API server. Redis queues the jobs, and Celery workers process them in the background, keeping the main app responsive. |
| **PySerial** | Python Library | Essential for enabling Python to send and receive UART serial data via USB, creating the bridge to our physical hardware. |

## 🧠 Machine Learning & AI

| Technology | What Form It Takes | Why We Use It |
|---|---|---|
| **YOLOv8 & PyTorch** | Vision Model Deep Learning | The state-of-the-art in real-time object detection. YOLOv8 is fast enough to process live webcam feeds at 30+ FPS directly on edge devices to identify bounding boxes of pests. |
| **OpenCV** | Computer Vision Library | Handles the lower-level processing, like opening camera streams, manipulating video frames, and drawing bounding boxes/calculating ROIs (Regions of Interest). |
| **Google Gemini API** | Large Language Model (LLM) | Acts as the "AI Agronomist." While YOLO detects *what* the pest is, Gemini analyzes the situation and tells the user *what to do about it*, giving actionable farming advice. |

## 🔌 Hardware & IoT (Internet of Things)

| Component | What Form It Takes | Why We Use It |
|---|---|---|
| **Arduino (Uno/Mega)** | Microcontroller | The physical brain of the edge hardware. It interprets signals sent by the Python backend via USB and translates them into physical electrical signals to control farm equipment. |
| **USB Webcams** | Input Device | Captures real-time vision of the crops for the YOLO model to analyze. |
| **LED Indicators** | Output Component | Hooked to `PIN_LED` to signal **Low Threat** situations (e.g., small, manageable aphid presence). |
| **Buzzer Alarm** | Output Component | Hooked to `PIN_BUZZER` to trigger an audible alarm during **High Threat** scenarios (e.g., active crop infections detected). |
| **Relay / Motor Pump** | Output Component | Hooked to `PIN_MOTOR_RELAY` to automatically turn on pesticide sprayers or physical repellants when a **Critical Threat** (e.g., a locust swarm) is detected. |

## 🐳 Deployment & Infrastructure

| Technology | What Form It Takes | Why We Use It |
|---|---|---|
| **Docker & Docker Compose** | Containerization | Packages the application and all its dependencies into isolated containers. This ensures the app runs precisely the same way on any operating system, bypassing the "it works on my machine" problem (heavily used for the Batch Mode). |
