// in frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [detections, setDetections] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setDetections(null);
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetections(response.data.detections);
      setError('');
    } catch (err) {
      setError('An error occurred during detection. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐞 Pest Detection Dashboard</h1>
        <p>Upload an image to detect pests using a YOLOv8 model.</p>
      </header>
      <main>
        <form onSubmit={handleSubmit} className="upload-form">
          <input type="file" onChange={handleFileChange} accept="image/*" />
          <button type="submit" disabled={isLoading || !file}>
            {isLoading ? 'Detecting...' : 'Detect Pests'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <div className="results-container">
          {preview && (
            <div className="image-preview">
              <h3>Your Image:</h3>
              <img src={preview} alt="Uploaded preview" />
            </div>
          )}

          {detections && (
            <div className="results">
              <h2>Detection Results:</h2>
              {detections.length > 0 ? (
                <ul>
                  {detections.map((pest, index) => (
                    <li key={index}>{pest}</li>
                  ))}
                </ul>
              ) : (
                <p>No pests were detected in the image.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;