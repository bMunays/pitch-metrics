import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light text-muted py-4 mt-auto border-top">
      <Container>
        <Row className="text-center text-md-start">
          <Col md={6} className="mb-3 mb-md-0">
            <p className="mb-0">&copy; {currentYear} Pitch Metrics. All rights reserved.</p>
          </Col>
          <Col md={6} className="text-md-end">
            <a href="#about" className="text-decoration-none text-muted me-3">About</a>
            <a href="#privacy" className="text-decoration-none text-muted me-3">Privacy Policy</a>
            <a href="#terms" className="text-decoration-none text-muted me-3">Terms of Usage</a>
            <a href="#licenses" className="text-decoration-none text-muted">Third-Party Licenses</a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;