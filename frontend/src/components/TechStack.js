import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaPython, FaReact } from 'react-icons/fa';
import { SiFlask } from 'react-icons/si';
import { AiOutlineRobot, AiOutlineApi } from 'react-icons/ai'; // Changed SiYolo to AiOutlineRobot
import '../styles/TechStack.css';

function TechStack() {
  const technologies = [
    { name: 'Python', icon: <FaPython /> },
    { name: 'Flask', icon: <SiFlask /> },
    { name: 'YOLOv8', icon: <AiOutlineRobot /> }, // <-- Using the new icon
    { name: 'React', icon: <FaReact /> },
    { name: 'IoT Integration', icon: <AiOutlineApi /> },
  ];

  return (
    <section className="tech-stack-section">
      <Container>
        <h2 className="section-title">Technology Powering Our System</h2>
        <Row className="justify-content-center">
          {technologies.map((tech, index) => (
            <Col key={index} xs={6} md={4} lg={2} className="tech-col">
              <div className="tech-card">
                <div className="tech-icon">{tech.icon}</div>
                <p className="tech-name">{tech.name}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default TechStack;

