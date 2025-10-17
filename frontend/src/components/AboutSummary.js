import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/AboutSummary.css'; // We'll create this file next

function AboutSummary() {
  return (
    <section className="about-summary-section">
      <Container>
        <h2 className="section-title">About the Project</h2>
        <p className="summary-text">
          This Smart Crop Monitor is a full-stack tool designed to help farmers protect their crops by leveraging the power of artificial intelligence and IoT. By providing quick and accurate pest detection and environmental monitoring, we aim to improve crop yields and promote sustainable farming practices.
        </p>
        <Button as={Link} to="/about" variant="outline-primary">Learn More</Button>
      </Container>
    </section>
  );
}

export default AboutSummary;
