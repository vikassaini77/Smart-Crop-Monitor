from ultralytics import YOLO

# This line ensures the code only runs when the script is executed directly
if __name__ == '__main__':
    # load model - Start with pretrained weights but we will fine-tune the head
    model = YOLO("yolov8n.pt")

    # train model - Production Grid
    model.train(
        data="configs/pest.yaml",
        epochs=50,             # Allow the model to converge properly
        imgsz=640,             # Standard high-res inference matches training dataset
        batch=8,               # Reduced batch size for 4GB VRAM
        workers=0,             # Set workers to 0 to fix Windows page file / multiprocessing error
        lr0=0.01,              # Standard initial learning rate
        patience=10,           # Early stopping if mAP doesn't improve for 10 epochs
        project="runs/detect", # Organize runs
        name="pest_detector_v2",
        # Adding explicitly what makes it better
        optimizer='auto',      # Let YOLO decide best optimizer (AdamW/SGD)
        verbose=True,          # Ensure clarity in logs
        device=0               # explicitly train on GPU 0
    )