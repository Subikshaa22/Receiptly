import React, { useContext } from 'react'; // Import necessary hooks from React
import { Navbar, Container, Nav } from 'react-bootstrap'; // Bootstrap components
import { Link, useNavigate } from 'react-router-dom'; // Routing components
import { AuthContext } from '../AuthContext'; // Custom context for authentication

// Header component definition
const Header = () => {
  // Extract authentication status and method to update it from AuthContext
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);

  // Hook to programmatically navigate
  const navigate = useNavigate();

  // Handle user logout: reset auth state and redirect to login page
  const handleLogout = () => {
    setIsAuthenticated(false); // Set authentication status to false
    navigate('/login'); // Redirect user to login page
  };

  // JSX returned by Header component
  return (
    // Main navbar with gradient background to match footer theme
    <Navbar
      expand="lg" // Enable collapse on small screens
      style={{
        background: 'linear-gradient(to right, #d7b3b8e7, #d7b3b8e7)', // Light rose gradient
      }}
      className="px-4" // Padding on left and right
    >
      <Container fluid>
        {/* Navbar brand/logo linked to home */}
        <Navbar.Brand
          as={Link}
          to="/"
          style={{
            color: 'white', // White text for contrast
            fontWeight: 'bold', // Emphasize brand
          }}
        >
          🧾 Receiptly
        </Navbar.Brand>

        {/* Navbar toggle for mobile view */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ backgroundColor: 'white' }} // White background for toggle button
        />

        {/* Collapsible nav content */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Check if user is logged in */}
            {isAuthenticated ? (
              <>
                {/* Links for authenticated users */}
                <Nav.Link as={Link} to="/dashboard" className="text-white">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/upload" className="text-white">
                  Upload Receipt
                </Nav.Link>
                <Nav.Link as={Link} to="/budget-planner" className="text-white">
                  Budget Planner
                </Nav.Link>
                <Nav.Link as={Link} to="/calendar" className="text-white">
                  Calendar
                </Nav.Link>
                <Nav.Link onClick={handleLogout} className="text-white">
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                {/* Links for unauthenticated users */}
                <Nav.Link as={Link} to="/login" className="text-white">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="text-white">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

// Export Header component as default export
export default Header;
