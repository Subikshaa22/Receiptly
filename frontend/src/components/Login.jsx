import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container } from 'react-bootstrap';
import { AuthContext } from '../AuthContext';

//login
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
    // Accessing authentication context to set auth state after login
  const { setIsAuthenticated } = useContext(AuthContext);

  // Handles form submission and API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
            // Sending login request to backend with email and password

      await axios.post('http://localhost:5000/api/auth/login', { email, password });

            // If successful, update authentication state

      setIsAuthenticated(true);

            // Redirect user to the upload page

      navigate('/upload');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };


    // JSX layout for the Login UI

  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(to right, #d7b3b8e7, #af737ae4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <Container className="d-flex justify-content-center align-items-center">
        <Card style={{ width: '400px', borderRadius: '20px', border: 'none' }} className="shadow-lg p-4 bg-white">
          <h3 className="text-center mb-4" style={{ color: '#7a3b45' }}>Login</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#d7b3b8e7'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#d7b3b8e7'
                }}
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100"
              style={{
                backgroundColor: '#d7b3b8e7',
                border: 'none',
                borderRadius: '25px',
                padding: '0.6rem',
                fontWeight: '500',
                color: 'white',
                transition: '0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#af737ae4';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#af737ae4';
              }}
            >
              Login
            </Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
}

export default Login;
