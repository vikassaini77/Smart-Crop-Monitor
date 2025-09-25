# in app.py
from flask import Flask, render_template, request, send_from_directory, flash, redirect, url_for, session
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

# --- APP & DATABASE CONFIGURATION ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_super_secret_key' # Change this to a random string
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
MODEL_PATH = 'best.pt'

# Initialize database
db = SQLAlchemy(app)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- DATABASE MODELS (TABLES) ---
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
    user = db.relationship('User', backref=db.backref('detections', lazy=True))

# --- MODEL LOADING ---
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# --- WEBSITE PAGES (ROUTES) ---
@app.route('/', methods=['GET', 'POST'])
def home():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    # Fetch detection history for the logged-in user
    user_detections = Detection.query.filter_by(user_id=session['user_id']).order_by(Detection.timestamp.desc()).all()
    return render_template('index.html', detections=user_detections)

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if request.method == 'POST':
        if model is None:
            flash("Model could not be loaded.", "danger")
            return redirect(url_for('predict'))
        
        if 'file' not in request.files:
            flash("No file part in the request.", "danger")
            return redirect(request.url)

        file = request.files['file']
        if file.filename == '':
            flash("No file selected.", "danger")
            return redirect(request.url)

        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            results = model.predict(filepath, verbose=False)
            result_image_array = results[0].plot()
            result_image_pil = Image.fromarray(result_image_array[..., ::-1])
            result_filename = 'result_' + filename
            result_filepath = os.path.join(app.config['UPLOAD_FOLDER'], result_filename)
            result_image_pil.save(result_filepath)

            for r in results:
                for box in r.boxes:
                    class_name = model.names[int(box.cls[0])]
                    confidence = float(box.conf[0])
                    new_detection = Detection(user_id=session['user_id'], pest_name=class_name, confidence=confidence, image_path=result_filename)
                    db.session.add(new_detection)
            db.session.commit()
            
            flash("Prediction successful!", "success")
            return redirect(url_for('home'))

    return render_template('predict.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Logged in successfully!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password.', 'danger')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists.', 'warning')
            return redirect(url_for('register'))

        password_hash = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, password_hash=password_hash)
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/dashboard')
def dashboard():
    """Renders the analytics dashboard page."""
    if 'user_id' not in session:
        return redirect(url_for('login'))

    all_detections = Detection.query.all()
    
    if not all_detections:
        return render_template('dashboard.html', no_data=True)

    df = pd.DataFrame([(d.pest_name, d.timestamp.date()) for d in all_detections], columns=['Pest', 'Date'])
    
    pest_counts = df['Pest'].value_counts()
    fig_pie = px.pie(values=pest_counts.values, names=pest_counts.index, title='Distribution of Detected Pests')
    pie_chart_json = json.dumps(fig_pie, cls=plotly.utils.PlotlyJSONEncoder)

    detections_by_date = df.groupby('Date').size().reset_index(name='Count')
    fig_bar = px.bar(detections_by_date, x='Date', y='Count', title='Pest Detections Over Time')
    bar_chart_json = json.dumps(fig_bar, cls=plotly.utils.PlotlyJSONEncoder)

    return render_template('dashboard.html', 
                           pie_chart_json=pie_chart_json, 
                           bar_chart_json=bar_chart_json)

# --- RUN THE APP ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)