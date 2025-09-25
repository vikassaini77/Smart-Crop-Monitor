from ultralytics import YOLO

# This line ensures the code only runs when the script is executed directly
if __name__ == '__main__':
    # load model
    model = YOLO("yolov8n.pt")

    # train model
    model.train(
        data="configs/pest.yaml",
        epochs=10,
        imgsz=320,
        batch=4,
        name="pest_detector"
    )