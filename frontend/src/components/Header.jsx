import React, { useContext } from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Header = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear session or flags
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="px-4">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          🧾 Receiptly
        </Navbar.Brand>
        <Nav className="ms-auto">
          {isAuthenticated ? (
            <>
              <Nav.Link as={Link} to="/dashboard" className="text-white">
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/budget-planner" className="text-white">
                Budget Planner
              </Nav.Link>
              <Nav.Link onClick={handleLogout} className="text-white">
                Logout
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link as={Link} to="/login" className="text-white">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/register" className="text-white">
                Register
              </Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
