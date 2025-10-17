import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

function Features() {
  return (
    <div className="features-section py-5">
      <Container>
        <h2 className="text-center mb-4">Why Choose Smart Crop Monitor?</h2>
        <Row>
          <Col md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>Instant Detection</Card.Title>
                <Card.Text>
                  Get real-time analysis of crop threats from images and videos.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>High Accuracy</Card.Title>
                <Card.Text>
                  Our advanced AI model ensures precise and reliable pest detection.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card>
              <Card.Body>
                <Card.Title>Historical Data</Card.Title>
                <Card.Text>
                  Track past detections to identify patterns and prevent future outbreaks.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Features;
