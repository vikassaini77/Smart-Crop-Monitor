import os, random, shutil

def split_dataset(image_dir, label_dir, output_dir, split_ratio=0.8):
    images = [f for f in os.listdir(image_dir) if f.endswith('.jpg')]
    random.shuffle(images)
    split_index = int(len(images) * split_ratio)

    train_imgs = images[:split_index]
    val_imgs = images[split_index:]

    for split, img_list in [("train", train_imgs), ("val", val_imgs)]:
        os.makedirs(os.path.join(output_dir, "images", split), exist_ok=True)
        os.makedirs(os.path.join(output_dir, "labels", split), exist_ok=True)

        for img in img_list:
            shutil.copy(os.path.join(image_dir, img), os.path.join(output_dir, "images", split, img))
            label_file = img.replace(".jpg", ".txt")
            if os.path.exists(os.path.join(label_dir, label_file)):
                shutil.copy(os.path.join(label_dir, label_file), os.path.join(output_dir, "labels", split, label_file))

if __name__ == "__main__":
    split_dataset("data/images", "data/labels", "data")
