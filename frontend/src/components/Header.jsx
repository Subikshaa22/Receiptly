import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => (
  <Navbar bg="dark" variant="dark" expand="lg" className="px-4">
    <Container fluid>
      <Navbar.Brand as={Link} to="/">
        🧾 Receiptly
      </Navbar.Brand>
      <Nav className="ms-auto">
        <Nav.Link as={Link} to="/login" className="text-white">
          Login
        </Nav.Link>
        <Nav.Link as={Link} to="/register" className="text-white">
          Register
        </Nav.Link>
      </Nav>
    </Container>
  </Navbar>
);

export default Header;
