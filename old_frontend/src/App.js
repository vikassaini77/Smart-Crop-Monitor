// in frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './dashboard';
import History from './History'; // Correct capitalization
import { Navbar, Container, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
          <Container>
            <Navbar.Brand as={Link} to="/">🐞 Smart-Crop-Monitor</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link as={Link} to="/">Detector</Nav.Link>
                <Nav.Link as={Link} to="/history">History</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Routes>

        <footer className="bg-dark text-white text-center p-4 mt-auto">
          <Container><p>&copy; 2025 Final Year Project</p></Container>
        </footer>
      </div>
    </Router>
  );
}
export default App;