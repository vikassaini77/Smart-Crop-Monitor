# Pest Detection using YOLOv8

## 🚀 Project Overview
This project uses YOLOv8 to detect different pest species from images.  
It is useful in agriculture to identify pests early and prevent crop damage.

## 📂 Project Structure
- `configs/pest.yaml` : dataset config file  
- `data/` : contains images and labels (YOLO format)  
- `scripts/split_dataset.py` : script to split train/val dataset  
- `train.py` : training script  
- `requirements.txt` : dependencies  

## ⚡ How to Run
```bash
# 1. Create environment
python -m venv pest_env
pest_env\Scripts\activate

# 2. Install requirements
pip install -r requirements.txt

# 3. Prepare dataset
python scripts/split_dataset.py

# 4. Train model
python train.py
```

## ✅ Output
Trained YOLOv8 model saved in `runs/detect/` folder.
# Smart-Crop-Monitor
# Smart-Crop-Monitor
# Smart-Crop-Monitor
