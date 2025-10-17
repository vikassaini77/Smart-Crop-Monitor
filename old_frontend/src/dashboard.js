// in frontend/src/Dashboard.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import './Dashboard.css';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file first.'); return; }
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict/', formData);
      setResult(response.data);
    } catch (err) {
      setError('An error occurred. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Container id="home" className="hero-section text-center text-white">
        <h1 className="hero-title">Intelligent Pest Detection</h1>
        <p className="hero-subtitle">Upload an image or video to protect your crops.</p>
        <Button variant="primary" size="lg" href="#detector">Get Started</Button>
      </Container>

      <Container id="detector" className="detector-section">
        <h2 className="section-title">Try the Detector</h2>
        <Card className="upload-card">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Control type="file" onChange={handleFileChange} accept="image/*,video/*" />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={isLoading || !file} size="lg">
                {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Detect Pests'}
              </Button>
            </Form>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Card.Body>
        </Card>

        {result && (
          <div className="mt-5">
            <h2 className="section-title">Detection Results</h2>
            <Row>
              <Col md={7}>
                <Card>
                  <Card.Header as="h5">Processed Output</Card.Header>
                  {result.file_type === 'image' ? (
                    <Card.Img variant="bottom" src={`http://127.0.0.1:8000${result.result_url}`} />
                  ) : (
                    <video src={`http://127.0.0.1:8000${result.result_url}`} controls autoPlay muted loop className="img-fluid" />
                  )}
                </Card>
              </Col>
              <Col md={5}>
                {result.detections.length > 0 ? result.detections.map((det, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Header as="h5">{det.pest_name}</Card.Header>
                    <Card.Body>
                      <Card.Text><strong>Description:</strong> {det.info.description}</Card.Text>
                    </Card.Body>
                  </Card>
                )) : <Alert variant="success">No pests were detected.</Alert>}
              </Col>
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
}
export default Dashboard;