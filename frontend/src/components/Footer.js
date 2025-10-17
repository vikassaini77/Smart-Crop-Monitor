import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/Footer.css'; // We will update this file next

function Footer() {
  return (
    <footer className="site-footer">
      <Container>
        <Row>
          {/* Column 1: About the Project */}
          <Col md={5} className="footer-col">
            <h5>🌱 Smart Crop Monitor</h5>
            <p>
              An intelligent farming system using AI for pest detection and IoT for environmental monitoring to improve crop yields and promote sustainable agriculture.
            </p>
          </Col>

          {/* Column 2: Quick Links */}
          <Col md={{ span: 3, offset: 1 }} className="footer-col">
            <h5>Quick Links</h5>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/history">History</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </Col>

          {/* Column 3: Contact */}
          <Col md={3} className="footer-col">
            <h5>Contact</h5>
            <ul className="footer-links">
              <li>Built by Vikas Saini</li>
              {/* Replace '#' with your actual links */}
              <li><a href="#" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
            </ul>
          </Col>
        </Row>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Smart Crop Monitor. All Rights Reserved.</p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
