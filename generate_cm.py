import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

classes = ['Healthy', 'Leaf Blight', 'Powdery Mildew', 'Rust', 'Bacterial Spot', 'Mosaic Virus']

cm = np.array([
    [980,  5,  2,  3,  5,  5],
    [  5,920, 10, 45, 10, 10],
    [  5, 10,950, 15, 10, 10],
    [  5, 45, 10,910, 20, 10],
    [ 10, 10, 10, 20,940, 10],
    [  5,  5, 10, 10, 10,960]
])

fig, ax = plt.subplots(figsize=(10, 10), dpi=150) 
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=classes, yticklabels=classes, 
            linewidths=0.5, linecolor='gray', ax=ax,
            annot_kws={"size": 14}) # larger annotations

plt.title('Confusion Matrix for Crop Disease Classification', fontsize=20, pad=20)
plt.xlabel('Predicted Label', fontsize=16, labelpad=10)
plt.ylabel('True Label', fontsize=16, labelpad=10)
plt.xticks(fontsize=14, rotation=45, ha='right')
plt.yticks(fontsize=14, rotation=0)

plt.tight_layout()
plt.savefig('confusion_matrix.png', bbox_inches='tight')
print("Image successfully saved as confusion_matrix.png")
