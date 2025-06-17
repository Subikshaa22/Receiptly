import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';

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
    <div className="container mt-4">
      <h2>Spending Calendar</h2>
      <Calendar onChange={setSelectedDate} value={selectedDate} />

      <div className="mt-4">
        <h4>Spending on {selectedDate.toDateString()}</h4>
        {receipts.length > 0 ? (
          receipts.map((receipt, i) => (
            <div key={i} className="card my-2">
              <div className="card-body">
                <h5>{receipt.merchant_name}</h5>
                <p>Address: {receipt.address}</p>
                <p>Total Amount: ₹{receipt.total_amount}</p>
                <p>Payment: {receipt.payment_method}</p>
                <p>Items:</p>
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
          <p>No receipts found for this date.</p>
        )}
      </div>
    </div>
  );
}

export default CalendarTab;
