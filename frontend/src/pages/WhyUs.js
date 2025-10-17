// src/pages/WhyUs.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaChartLine, FaRegClock } from 'react-icons/fa';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../styles/WhyUs.css';

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  {
    icon: <FaShieldAlt />,
    title: "Protect Your Investment",
    description: "Detect pests early before they can cause widespread damage. Our AI acts as a 24/7 scout for your farm, helping you save your crops and secure your profits."
  },
  {
    icon: <FaChartLine />,
    title: "Make Data-Driven Decisions",
    description: "Stop guessing. With live data from IoT sensors and a history of past detections, you can understand your farm's health like never before and take precise, effective action."
  },
  {
    icon: <FaRegClock />,
    title: "Act Fast, Save Time",
    description: "Get instant, accurate results from a simple photo. No more waiting for manual inspections. Our system gives you the information you need, right when you need it."
  }
];

function WhyUs() {
  const [cropsSaved, setCropsSaved] = useState(0);
  const [farmsMonitored, setFarmsMonitored] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    // Counter animation
    const interval1 = setInterval(() => setCropsSaved(prev => prev < 1200 ? prev + 20 : prev), 40);
    const interval2 = setInterval(() => setFarmsMonitored(prev => prev < 350 ? prev + 5 : prev), 60);

    // GSAP animations
    const sections = sectionRef.current.querySelectorAll('.glass-section');
    sections.forEach(section => {
      // Fade-up animation for each section
      gsap.fromTo(section, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: section, start: 'top 80%' }
        }
      );

      // Animate children stagger
      const children = section.querySelectorAll('.animate-child');
      if (children.length > 0) {
        gsap.fromTo(children, 
          { y: 20, opacity: 0 }, 
          { y: 0, opacity: 1, stagger: 0.2, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 80%' }
          }
        );
      }
    });

    return () => { clearInterval(interval1); clearInterval(interval2); ScrollTrigger.getAll().forEach(st => st.kill()); };
  }, []);

  return (
    <div className="why-us-page" ref={sectionRef}>

      {/* Challenge Section */}
      <section className="glass-section challenge-section">
        <Container>
          <h1 className="text-center animate-child">Facing Uncertainty with Your Crops?</h1>
          <p className="lead text-center animate-child">
            Pest infestations can happen fast, threatening your harvest and livelihood. Traditional methods of detection are often too slow, leading to significant losses.
          </p>
          <div className="challenge-image-wrapper mx-auto animate-child">
            <img 
              src="https://wallpaperbat.com/img/319677-agriculture-desktop-wallpaper.jpg" 
              alt="background" 
              className="challenge-image"
            />
          </div>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="glass-section benefits-section">
        <Container>
          <h2 className="section-title text-center animate-child">Your Modern Solution for a Healthier Harvest</h2>
          <Row className="justify-content-center">
            {benefits.map((benefit, index) => (
              <Col md={4} sm={6} key={index} className="benefit-col mb-4 animate-child">
                <div className="benefit-card">
                  <div className="benefit-icon">{benefit.icon}</div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </div>
              </Col>
            ))}
          </Row>

          {/* Animated Counters */}
          <Row className="text-center mt-5 stats-row">
            <Col md={6} className="animate-child">
              <h3 className="counter">{cropsSaved}+</h3>
              <p>Crops Saved</p>
            </Col>
            <Col md={6} className="animate-child">
              <h3 className="counter">{farmsMonitored}+</h3>
              <p>Farms Monitored</p>
            </Col>
          </Row>

          {/* CTA Button */}
          <div className="text-center mt-5 animate-child">
            <Button 
              as={Link} 
              to="/dashboard" 
              variant="success" 
              size="lg"
              className="glass-btn cta-btn"
            >
              Try the Dashboard Now
            </Button>
          </div>
        </Container>
      </section>

    </div>
  );
}

export default WhyUs;
