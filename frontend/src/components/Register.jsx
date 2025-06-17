import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [strengthColor, setStrengthColor] = useState('danger');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [matchError, setMatchError] = useState('');

  const validatePassword = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-={};':"\\|,.<>/?`~]/.test(password);
    const length = password.length;

    if (length < 6) {
      setPasswordStrength('Too short');
      setStrengthColor('danger');
    } else if (!hasNumber && !hasSpecialChar) {
      setPasswordStrength('Weak');
      setStrengthColor('danger');
    } else if ((hasNumber && !hasSpecialChar) || (!hasNumber && hasSpecialChar)) {
      setPasswordStrength('Medium');
      setStrengthColor('warning');
    } else if (hasNumber && hasSpecialChar) {
      setPasswordStrength('Strong');
      setStrengthColor('success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMatchError('Passwords do not match');
      return;
    }

    const hasNumber = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-={};':"\\|,.<>/?`~]/.test(formData.password);

    if (!hasNumber || !hasSpecialChar) {
      alert('Password must contain at least one number and one special character.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      alert(res.data.message);
      navigate('/login'); // 👈 redirect to Login.jsx
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

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
        <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '20px', border: 'none' }} className="shadow-lg p-4 bg-white">
          <h3 className="text-center mb-4" style={{ color: '#7a3b45' }}>Register</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="formName">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7' }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formEmail">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7' }}
              />
            </Form.Group>

            <Form.Group className="mb-4 position-relative" controlId="formPassword">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Password</Form.Label>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, password: value });
                  validatePassword(value);
                  setMatchError('');
                }}
                required
                style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7', paddingRight: '2.5rem' }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '72%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  color: '#7a3b45',
                  userSelect: 'none'
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </Form.Group>

            {formData.password && (
              <div
                className={`alert alert-${strengthColor} py-2 px-3 d-flex align-items-center gap-2 mb-3`}
                style={{ borderRadius: '12px', fontSize: '0.9rem' }}
              >
                <span role="img" aria-label="alert" style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span>
                  {passwordStrength === 'Too short' && 'Password must be at least 6 characters long.'}
                  {passwordStrength === 'Weak' && 'Password must include a number and a special character.'}
                  {passwordStrength === 'Medium' && 'Almost there! Add both a number and a special character.'}
                  {passwordStrength === 'Strong' && 'Great! Your password is strong.'}
                </span>
              </div>
            )}

            <Form.Group className="mb-4 position-relative" controlId="formConfirmPassword">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Confirm Password</Form.Label>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setMatchError('');
                }}
                required
                style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7', paddingRight: '2.5rem' }}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '15px',
                  top: '72%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  color: '#7a3b45',
                  userSelect: 'none'
                }}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </span>
            </Form.Group>

            {matchError && (
              <div
                className="alert alert-danger py-2 px-3"
                style={{ borderRadius: '12px', fontSize: '0.9rem' }}
              >
                ❗ {matchError}
              </div>
            )}

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
              Register
            </Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
}

export default Register;
