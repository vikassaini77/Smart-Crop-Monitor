import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function NavbarComponent({ theme, toggleTheme }) {
  return (
    <Navbar expand="lg" fixed="top" className={`navbar ${theme}`}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          🌱 Smart Crop Monitor
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/" className="nav-link">Home</Nav.Link>
            <Nav.Link as={Link} to="/why-us" className="nav-link">Why Us?</Nav.Link>
            <Nav.Link as={Link} to="/dashboard" className="nav-link">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/history" className="nav-link">History</Nav.Link>
            <Nav.Link as={Link} to="/stats" className="nav-link">Global Insights</Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link">About</Nav.Link>
            <button onClick={toggleTheme} className="theme-toggle-button">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComponent;
