import React from 'react';
import { Container } from 'react-bootstrap';

const Home = () => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to right, #d7b3b8e7, #af737ae4)',
      fontFamily: 'Poppins, sans-serif',
      minHeight: 'calc(100vh - 56px - 60px)', // Subtract header + footer height (adjust if needed)
    }}
  >
    <Container
      className="text-center"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 0 15px rgba(0,0,0,0.1)',
        animation: 'fadeIn 1s ease-in-out',
        maxWidth: '600px',
      }}
    >
      <h1 style={{ color: '#7a3b45', fontWeight: '600' }}>Welcome to Receiptly 🧾</h1>
      <p style={{ color: '#7a3b45', fontSize: '1.1rem', marginBottom: 0 }}>
        Please Login or Register to get started.
      </p>
    </Container>

    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

export default Home;
