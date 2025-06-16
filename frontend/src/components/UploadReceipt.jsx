import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Spinner, Card } from 'react-bootstrap';

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
    <Container className="my-5">
      <h2 className="text-center mb-4">📤 Upload Your Receipt</h2>

      <Card className="p-4 shadow w-75 mx-auto">
        <Form>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select an image file</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          </Form.Group>

          <div className="text-center">
            <Button variant="primary" onClick={handleUpload} disabled={loading}>
              {loading ? <><Spinner animation="border" size="sm" /> Uploading...</> : 'Extract'}
            </Button>
          </div>
        </Form>
      </Card>

      {receipt && (
        <Card className="mt-5 p-4 shadow w-75 mx-auto">
          <h4 className="mb-3">🧾 Parsed Receipt</h4>
          <p><strong>Merchant:</strong> {receipt.merchant_name}</p>
          <p><strong>Date:</strong> {receipt.date}</p>
          <p><strong>Total:</strong> ₹{receipt.total_amount}</p>

          <h5 className="mt-3">Items</h5>
          <ul className="list-group">
            {receipt.items.map((item, idx) => (
              <li key={idx} className="list-group-item">
                {item.name} - ₹{item.total_price} ({item.category})
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Container>
  );
};

export default UploadReceipt;
