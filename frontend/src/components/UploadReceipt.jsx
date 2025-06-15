import React, { useState } from 'react';
import axios from 'axios';

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
    <div style={{ padding: 20 }}>
      <h2>Receipt OCR Uploader</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload & Extract'}
      </button>

      {receipt && (
        <div style={{ marginTop: 20 }}>
          <h3>Parsed Receipt</h3>
          <p><strong>Merchant:</strong> {receipt.merchant_name}</p>
          <p><strong>Date:</strong> {receipt.date}</p>
          <p><strong>Total:</strong> ₹{receipt.total_amount}</p>
          <h4>Items:</h4>
          <ul>
            {receipt.items.map((item, idx) => (
              <li key={idx}>{item.name} - ₹{item.total_price} ({item.category})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadReceipt;
