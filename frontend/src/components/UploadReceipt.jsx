import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Spinner, Card } from 'react-bootstrap';
import './UploadReceipt.css';

const UploadReceipt = () => {
  const [file, setFile] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image");

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/receipts', formData);
      setReceipt(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page">
      <div className="side-image left" />
      <div className="side-image right" />
      
      <div className="scroll-wrapper">
        <Container className="upload-page">
          <h2 className="upload-heading">Upload Receipt</h2>

          <Card className="upload-box">
            <Form>
              <Form.Group controlId="formFile">
                <Form.Label className="upload-label">Select an image file</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="upload-input"
                />
              </Form.Group>

              <div className="btn-wrapper">
                <Button className="upload-button" onClick={handleUpload} disabled={loading}>
                  {loading ? <><Spinner animation="border" size="sm" /> Uploading...</> : 'Extract'}
                </Button>
              </div>
            </Form>
          </Card>

          {receipt && (
            <Card className="receipt-display">
              <h4 className="receipt-heading">Receipt Details</h4>
              <p><strong>Merchant:</strong> {receipt.merchant_name}</p>
              <p><strong>Date:</strong> {receipt.date}</p>
              <p><strong>Total:</strong> ₹{receipt.total_amount}</p>

              <h5 className="items-heading">Items</h5>
              <ul className="items-list">
                {receipt.items.map((item, idx) => (
                  <li key={idx} className="item-row">
                    <span>{item.name}</span>
                    <span>₹{item.total_price}</span>
                    <span className="item-category">({item.category})</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Container>
      </div>

      
    </div>
  );
};

export default UploadReceipt;
