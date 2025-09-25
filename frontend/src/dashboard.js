// in frontend/src/Dashboard.js
import React, { useState } from 'react';
import axios from 'axios';
import { Navbar, Container, Nav, Form, Button, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import './Dashboard.css';

function Dashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileType, setFileType] = useState('image'); // To track if it's an image or video

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError('');
      // Check if the file is a video
      if (selectedFile.type.startsWith('video/')) {
        setFileType('video');
      } else {
        setFileType('image');
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://127.0.0.1:8000/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      
      const fileUrl = URL.createObjectURL(response.data);
      setResult({ url: fileUrl, type: fileType }); // Store URL and type
      setError('');
    } catch (err) {
      setError('An error occurred. Please ensure the backend is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="Dashboard">
      {/* --- NAVIGATION BAR --- */}
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand href="#home">🐞 Pest Detector</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#detector">Detector</Nav.Link>
              <Nav.Link href="#about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* --- HERO SECTION --- */}
      <Container id="home" className="hero-section text-center text-white">
        <h1 className="hero-title">Intelligent Pest Detection for Modern Agriculture</h1>
        <p className="hero-subtitle">Upload an image or video to get started.</p>
        <Button variant="primary" size="lg" href="#detector">Get Started</Button>
      </Container>

      {/* --- DETECTOR SECTION --- */}
      <Container id="detector" className="detector-section">
        <h2 className="section-title">Try the Detector</h2>
        <Card className="upload-card">
          <Card.Body>
            <Card.Title>Upload an Image or Video of a Plant or Pest</Card.Title>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formFile" className="mb-3">
                {/* --- IMPORTANT: Updated 'accept' attribute --- */}
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
          <Card className="result-card mt-4">
            <Card.Body>
              <Card.Title>Detection Result</Card.Title>
              {/* --- Conditionally render an image or video tag --- */}
              {result.type === 'image' ? (
                <img src={result.url} alt="Detection result" className="img-fluid" />
              ) : (
                <video src={result.url} controls autoPlay className="img-fluid" />
              )}
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* --- (About Section and Footer stay the same) --- */}
      <Container id="about" className="about-section">
        {/* ... your about content ... */}
      </Container>
      <footer className="bg-dark text-white text-center p-4 mt-auto">
        {/* ... your footer content ... */}
      </footer>
    </div>
  );
}

export default Dashboard;