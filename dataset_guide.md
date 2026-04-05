# Dataset Cleaning & Hard Negative Mining Guide

To permanently fix the issue of YOLO detecting human faces or background artifacts as pests (e.g., "earworms"), you must alter your training dataset. The model only knows what you show it. If it has never seen a human or an empty background *without* a bounding box, it assumes everything it sees MUST be one of your 12 classes.

## 1. Hard Negative Mining

**What is it?**
A "Hard Negative" is an image that looks like the environment where the camera operates but contains ZERO target objects. By feeding this into YOLO with an empty text file (zero bounding boxes), the model explicitly learns "This is background; ignore it."

**Steps to Implement:**
1. Collect 100-200 images of:
   * Empty fields and crops without pests.
   * Human faces, hands, and arms (since these often get in the way of the camera).
   * Farming equipment, tractors, or the Arduino setup.
2. Add these images to your `train/images` folder.
3. For each of these images, create an empty `.txt` file with the exact same name in the `train/labels` folder.
   * Example: `empty_field_01.jpg` -> `empty_field_01.txt` (0 bytes).
4. Do the same for `valid/images` (around 20-30 images).

## 2. Dataset Cleaning Strategy

Run through your dataset and ensure:
* **No Label Noise**: Delete images where the bounding box is slightly off or missing a visible pest.
* **Balanced Classes**: If `Caterpillars` has 1,000 images but `Earwigs` only has 50, the model will bias towards Caterpillars. Try to keep all 12 classes between 300 and 500 images.
* **Correct Indexing**: Verify that in every `.txt` file, the first number matches `configs/pest.yaml`. For example, `0` should perfectly align with `Ants`.

## 3. Recommended Augmentations (Roboflow)

If you use Roboflow, apply these augmentations before generating your YOLOv8 dataset:
* **Flip**: Horizontal and Vertical (insects appear in any orientation).
* **Crop**: 0% Minimum Zoom, 20% Maximum Zoom (simulates the camera moving closer/further).
* **Brightness**: Between -25% and +25% (accounts for shadows and direct sunlight in the field).
* **Blur**: Up to 1.5px (simulates motion blur from a hand-held or shaking camera/plant).
