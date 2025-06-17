import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import './CalendarTab.css';

function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [receipts, setReceipts] = useState([]);

  const fetchReceipts = async (date) => {
    const formatted =
      date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');

    try {
      const res = await axios.get(`http://localhost:5000/api/spending?date=${formatted}`);
      setReceipts(res.data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setReceipts([]);
    }
  };

  useEffect(() => {
    fetchReceipts(selectedDate);
  }, [selectedDate]);

  return (
    <div className="calendar-container">
      <h2 className="calendar-heading">Spending Calendar</h2>
      <div className="calendar-wrapper">
        <Calendar onChange={setSelectedDate} value={selectedDate} />
      </div>

      <div className="receipt-section">
        <h4 className="selected-date">Spending on {selectedDate.toDateString()}</h4>
        {receipts.length > 0 ? (
          receipts.map((receipt, i) => (
            <div key={i} className="receipt-card">
              <div className="receipt-content">
                <h5>{receipt.merchant_name}</h5>
                <p><strong>Address:</strong> {receipt.address}</p>
                <p><strong>Total Amount:</strong> ₹{receipt.total_amount}</p>
                <p><strong>Payment:</strong> {receipt.payment_method}</p>
                <p><strong>Items:</strong></p>
                <ul>
                  {receipt.items.map((item, j) => (
                    <li key={j}>
                      {item.name} × {item.quantity} = ₹{item.total_price}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p className="no-receipts">No receipts found for this date.</p>
        )}
      </div>
    </div>
  );
}

export default CalendarTab;
