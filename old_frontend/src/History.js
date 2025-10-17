// in frontend/src/History.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';

function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/history/');
        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Container className="detector-section">
      <h2 className="section-title">Detection History</h2>
      {isLoading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Row>
          {history.length > 0 ? history.map((item) => (
            <Col md={4} lg={3} key={item.id} className="mb-4">
              <Card>
                <Card.Img variant="top" src={`http://127.0.0.1:8000${item.image_url}`} />
                <Card.Body>
                  <Card.Title>{item.pest_name}</Card.Title>
                  <Card.Text><small className="text-muted">Detected: {item.timestamp}</small></Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )) : <Alert variant="info">No detection history found. Make a new prediction to start!</Alert>}
        </Row>
      )}
    </Container>
  );
}
export default History;