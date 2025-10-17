import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/HowItWorks.css'; // You will also need to create this CSS file

// ... (SVG icons for Upload, Brain, Results) ...
const UploadIcon = () => ( <svg>...</svg> );
const BrainIcon = () => ( <svg>...</svg> );
const ResultsIcon = () => ( <svg>...</svg> );

function HowItWorks() {
  const steps = [
    {
      icon: <UploadIcon />,
      title: "1. Upload Image",
      description: "Simply select an image or video of a crop leaf from your device."
    },
    {
      icon: <BrainIcon />,
      title: "2. AI Analysis",
      description: "Our advanced AI instantly analyzes the image for signs of common pests and diseases."
    },
    {
      icon: <ResultsIcon />,
      title: "3. Get Results",
      description: "Receive a clear, actionable diagnosis in seconds, helping you protect your crops."
    }
  ];

  return (
    <section className="how-it-works-section">
      <Container>
        <h2 className="section-title">How It Works</h2>
        <Row>
          {steps.map((step, index) => (
            <Col md={4} key={index} className="step-col">
              <div className="step-card">
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default HowItWorks;