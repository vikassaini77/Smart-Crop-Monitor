import React, { useState } from 'react';
import { Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import PestInfoModal from './PestInfoModal';

// This is the complete, "smart" component that handles all its own logic.
function Detector() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null); // This will store the full result object
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null); // Clear previous result when a new file is chosen
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDetect = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first!');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Store the entire result object from the backend
      setResult({
          name: response.data.result || 'No pests detected.',
          dangers: response.data.dangers || 'No information available.',
          outputImage: `${response.data.output_image_url}?t=${new Date().getTime()}`
      });
      toast.success('Detection complete!');
    } catch (error) {
      console.error("Error during detection:", error);
      toast.error('An error occurred. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    // The component is self-contained within a React Fragment
    <>
      <Form.Group controlId="formFileDetectorInModal" className="mb-3">
        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
      </Form.Group>

      <Row className="my-3">
        <Col md={6} className={!result ? 'mx-auto' : ''}>
          {preview && (
            <div>
              <h5 className="image-label">Original</h5>
              <img src={preview} alt="Preview" className="img-fluid rounded" />
            </div>
          )}
        </Col>
        {result && (
          <Col md={6}>
            <div>
              <h5 className="image-label">Detection Result</h5>
              <img src={result.outputImage} alt="Result" className="img-fluid rounded" />
            </div>
          </Col>
        )}
      </Row>
    
      <div className="d-grid mt-3">
        <Button variant="primary" size="lg" onClick={handleDetect} disabled={loading || !selectedFile}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Detect Pest'}
        </Button>
      </div>

      {result && !loading && (
        <div className="mt-4">
          <Alert variant={result.name.includes('Detected') ? 'danger' : 'success'}>
            <strong>Result:</strong> {result.name}
          </Alert>
          {result.dangers !== 'No information available.' && (
              <div className="d-grid mt-2">
                  <Button variant="outline-primary" onClick={handleShowModal}>
                      View Prevention & Dangers
                  </Button>
              </div>
          )}
        </div>
      )}

      <PestInfoModal 
        show={showModal} 
        handleClose={handleCloseModal} 
        pestName={result?.name} 
        pestInfo={result?.dangers}
      />
    </>
  );
}

export default Detector;

