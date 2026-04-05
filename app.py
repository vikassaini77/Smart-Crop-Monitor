from flask import Flask, render_template, request, send_from_directory, flash, redirect, url_for, session, jsonify
from ultralytics import YOLO
from PIL import Image
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import os
import pandas as pd
import plotly
import plotly.express as px
import json
import cv2
import threading
from backend.arduino import arduino

# --- APP CONFIG ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_super_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
MODEL_PATH = 'best.pt'

db = SQLAlchemy(app)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- GLOBAL DETECTION STATE ---
latest_detection = {}

# --- DATABASE MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)

class Detection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    pest_name = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    image_path = db.Column(db.String(300), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

# --- LOAD MODEL ---
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print("Model load error:", e)
    model = None

# 🔥 WEBCAM DETECTION THREAD
def run_detection():
    global latest_detection

    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        results = model(frame)

        pest_detected = False

        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])

                latest_detection = {
                    "pest": model.names[cls],
                    "confidence": round(conf, 2)
                }
                
                if conf > 0.4:
                    pest_detected = True

        if pest_detected:
            arduino.send_signal('1')
        else:
            arduino.send_signal('0')

# Start background thread
threading.Thread(target=run_detection, daemon=True).start()

# --- API ROUTE (FastAPI replacement) ---
@app.route('/api/detect', methods=['GET'])
def get_detection():
    return jsonify(latest_detection)

# --- ROUTES ---
@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    detections = Detection.query.filter_by(user_id=session['user_id']).all()
    return render_template('index.html', detections=detections)

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        file = request.files['file']
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        results = model.predict(filepath)

        for r in results:
            for box in r.boxes:
                class_name = model.names[int(box.cls[0])]
                confidence = float(box.conf[0])

                db.session.add(Detection(
                    user_id=session['user_id'],
                    pest_name=class_name,
                    confidence=confidence,
                    image_path=filename
                ))

        db.session.commit()
        flash("Prediction done!", "success")
        return redirect(url_for('home'))

    return render_template('predict.html')

# --- AUTH ---
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()

        if user and check_password_hash(user.password_hash, request.form['password']):
            session['user_id'] = user.id
            return redirect(url_for('home'))

        flash("Invalid credentials", "danger")

    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        hashed = generate_password_hash(request.form['password'])

        db.session.add(User(
            username=request.form['username'],
            password_hash=hashed
        ))
        db.session.commit()

        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# --- DASHBOARD ---
@app.route('/dashboard')
def dashboard():
    detections = Detection.query.all()

    if not detections:
        return render_template('dashboard.html', no_data=True)

    df = pd.DataFrame([(d.pest_name, d.timestamp.date()) for d in detections], columns=['Pest', 'Date'])

    fig = px.pie(df, names='Pest')
    pie = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)

    return render_template('dashboard.html', pie_chart_json=pie)

# --- RUN ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)