import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Detector from '../components/Detector';
import IotMonitoring from '../components/IotMonitoring';

function Dashboard() {
  return (
    <div className="dashboard-page py-4">
      <Container fluid>
        <h1 className="text-center mb-4 text-info">Smart Farm Dashboard</h1>
        <Row>
          {/* AI Pest Detector */}
          <Col lg={6} className="mb-4">
            <Detector />
          </Col>

          {/* IoT Monitoring */}
          <Col lg={6} className="mb-4">
            <IotMonitoring />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;
