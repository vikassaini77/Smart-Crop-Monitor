import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner, Alert, Image } from 'react-bootstrap';

function Detector() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file first.'); return; }
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      const imageUrl = URL.createObjectURL(response.data);
      setResult({ imageUrl });
    } catch (err) {
      setError('An error occurred. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="detector-card h-100">
      <Card.Body>
        <Card.Title className="text-center">AI Pest Detector</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
          </Form.Group>
          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={isLoading || !file}>
              {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Detect Pests'}
            </Button>
          </div>
        </Form>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        
        <div className="mt-4">
          {preview && !result && (
            <div>
              <h6>Image Preview:</h6>
              <Image src={preview} thumbnail />
            </div>
          )}
          {result && (
            <div>
              <h6>Detection Result:</h6>
              <Image src={result.imageUrl} thumbnail />
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default Detector;
