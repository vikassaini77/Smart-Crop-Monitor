# in create_graph.py
import os
import shutil

# --- CONFIGURATION ---
# The specific training run folder that contains your results
# You can change this number if you train a new model in the future
TRAINING_RUN_FOLDER = r"runs\detect\pest_detector14"

# --- SCRIPT LOGIC ---
def find_and_copy_charts():
    """
    Finds the specified YOLOv8 training folder and copies the result charts
    into the main project directory.
    """
    # Check if the specified training folder exists
    if not os.path.exists(TRAINING_RUN_FOLDER):
        print(f"ERROR: The specified training folder was not found: '{TRAINING_RUN_FOLDER}'")
        print("Please make sure the folder name is correct.")
        return

    print(f"Looking for charts in: '{TRAINING_RUN_FOLDER}'")

    # Define the chart files we want to copy
    charts_to_copy = ["results.png", "confusion_matrix.png"]
    
    found_charts = False
    for chart_name in charts_to_copy:
        source_path = os.path.join(TRAINING_RUN_FOLDER, chart_name)
        
        if os.path.exists(source_path):
            destination_path = os.path.join(".", f"paper_{chart_name}")
            shutil.copy(source_path, destination_path)
            print(f"✅ Copied '{chart_name}' to '{destination_path}'")
            found_charts = True
        else:
            print(f"⚠️ Warning: Chart '{chart_name}' not found in the specified folder.")
    
    if not found_charts:
        print("\nERROR: No result charts were found.")
    else:
        print("\nProcess complete. You can now add these chart images to your research paper.")

# --- RUN THE SCRIPT ---
if __name__ == '__main__':
    find_and_copy_charts()