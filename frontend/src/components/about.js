// src/pages/About.jsx
import React, { useEffect, useLayoutEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPython, FaReact, FaDatabase } from 'react-icons/fa';
import { SiFastapi, SiTensorflow, SiArduino } from 'react-icons/si';
import { gsap } from 'gsap';
import '../styles/AboutPage.css';

const techStack = [
  { name: 'YOLOv8', icon: <SiTensorflow size={40} color="#FF6F00" />, category: 'AI Model' },
  { name: 'Python', icon: <FaPython size={40} color="#306998" />, category: 'Backend' },
  { name: 'FastAPI', icon: <SiFastapi size={40} color="#009688" />, category: 'Backend' },
  { name: 'React', icon: <FaReact size={40} color="#61DBFB" />, category: 'Frontend' },
  { name: 'SQLite', icon: <FaDatabase size={40} color="#003B57" />, category: 'Database' },
  { name: 'Arduino', icon: <SiArduino size={40} color="#00979D" />, category: 'IoT Prototype' },
];

function About() {
  // Fade-in animation for sections
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-section", {
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  // Bounce animation for tech icons
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".tech-icon",
        { y: -5 },
        { y: 5, repeat: -1, yoyo: true, duration: 1, ease: "sine.inOut", stagger: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="about-page-container">
      <Container>
        {/* --- Section 1: Introduction & Goal --- */}
        <section className="about-section glass-box text-center">
          <h1 className="page-title">About Smart Crop Monitor</h1>
          <p className="lead-text">
            This project addresses a critical challenge in Indian agriculture: the significant loss of crops due to pest infestations. "Smart-Crop-Monitor" is an AI-powered system designed to provide an affordable, automated solution for real-time pest detection, empowering farmers with early detection capabilities to reduce crop loss and promote sustainable farming.
          </p>
        </section>

        {/* --- Section 2: Technology Stack --- */}
        <section className="about-section">
          <h2 className="section-title">Technology Stack</h2>
          <Row className="g-4">
            {techStack.map((tech, index) => (
              <Col key={index} md={4} sm={6}>
                <div className="tech-card glass-box text-center p-3">
                  <div className="tech-icon mb-2">{tech.icon}</div>
                  <div className="tech-info">
                    <div className="tech-name fw-bold">{tech.name}</div>
                    <div className="tech-category text-muted">{tech.category}</div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </section>

        {/* --- Section 3: Project Workflow --- */}
<section className="about-section glass-box">
  <h2 className="section-title text-center mb-4">Project Workflow</h2>
  <div className="workflow-container">
    {[
      "User uploads an image or video via the React web application.",
      "The frontend sends the file to the FastAPI backend for analysis.",
      "The YOLOv8 AI model performs real-time pest detection.",
      "Results are processed, annotated, and detailed information is retrieved from a JSON file.",
      "The complete analysis is sent back and displayed in a professional UI on the frontend.",
      "A record of the detection is saved to the SQLite database.",
      "A signal is sent to a connected Arduino to trigger a physical alert."
    ].map((step, i) => (
      <div key={i} className={`workflow-step ${i % 2 === 0 ? 'left' : 'right'}`}>
        <div className="step-number">{i + 1}</div>
        <div className="step-content">{step}</div>
      </div>
    ))}
  </div>
</section>


        {/* --- Section 4: Meet the Developer --- */}
        <section className="about-section text-center glass-box">
          <h2>Meet the Developer</h2>
          <p>This project was designed and built by Vikas Saini.</p>
          <div className="developer-links">
            <a href="#" className="btn btn-outline-primary mx-2">GitHub</a>
            <a href="#" className="btn btn-outline-primary mx-2">LinkedIn</a>
          </div>
        </section>
      </Container>
    </div>
  );
}

export default About;
