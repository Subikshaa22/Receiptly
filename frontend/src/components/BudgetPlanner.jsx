import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

// List of predefined categories for dropdown
const predefinedCategories = [
  'grocery', 'dairy', 'beverages', 'personal_care', 'medicines', 'stationery', 'electronics',
  'fast_food', 'snacks', 'cleaning_supplies', 'baby_products', 'frozen_food', 'bakery',
  'fruits_vegetables', 'home_appliances', 'pet_supplies', 'clothing', 'cosmetics',
  'meat', 'miscellaneous'
];

const BudgetPlanner = () => {
  // State to manage income
  const [income, setIncome] = useState('');
  // State to manage desired savings
  const [savings, setSavings] = useState('');
  // State for spending categories
  const [categories, setCategories] = useState([{ name: '', amount: '', isCustom: false, customName: '' }]);
  // Toggle display of budget summary
  const [showBudget, setShowBudget] = useState(false);

  // Handle changes in category dropdown or amount
  const handleCategoryChange = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = value;

    // If user selects 'Other', show input field for custom category
    if (field === 'name' && value === 'Other') {
      updated[index].isCustom = true;
      updated[index].customName = '';
    } else if (field === 'name') {
      updated[index].isCustom = false;
      updated[index].customName = '';
    }

    setCategories(updated);
  };

  // Handle custom category name input
  const handleCustomNameChange = (index, value) => {
    const updated = [...categories];
    updated[index].customName = value;
    setCategories(updated);
  };

  // Add a new blank category row
  const handleAddCategory = () => {
    setCategories([...categories, { name: '', amount: '', isCustom: false, customName: '' }]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  setShowBudget(true);

  const formattedCategories = categories.map(cat => ({
    name: cat.isCustom ? cat.customName : cat.name,
    amount: parseFloat(cat.amount || 0)
  }));

  try {
    const response = await fetch('http://localhost:5000/api/budgetplan/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        income: parseFloat(income),
        savings: parseFloat(savings),
        categories: formattedCategories
      })
    });

    const data = await response.json();
    console.log(data.message || data);
  } catch (error) {
    console.error('Error saving budget plan:', error);
  }
};


  // Calculate total allocated amount
  const totalAllocated = categories.reduce((sum, cat) => sum + parseFloat(cat.amount || 0), 0);
  // Calculate income that can be spent
  const spendable = income - savings;
  // Remaining money after allocation
  const remainder = spendable - totalAllocated;

  // Chart.js Pie data setup
  const pieData = {
    labels: categories.map(cat => (cat.isCustom ? cat.customName : cat.name)),
    datasets: [
      {
        label: 'Spending Distribution',
        data: categories.map(cat => parseFloat(cat.amount || 0)),
        backgroundColor: [
          '#f49ca2', '#af737a', '#d7b3b8', '#f5c3c7', '#e8a5ac', '#db7982',
          '#bb5463', '#e899a2', '#c47780', '#ad5d65', '#f2c9ce', '#f7e6e9'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(to right, #d7b3b8e7, #af737ae4)',
        overflowY: 'auto',
        fontFamily: 'Poppins, sans-serif',
        paddingTop: '60px',
        paddingBottom: '40px'
      }}
    >
      <Container className="d-flex flex-column align-items-center">
        {/* Budget Form Card */}
        <Card style={{ width: '100%', maxWidth: '600px', borderRadius: '20px', border: 'none' }} className="shadow-lg p-4 bg-white">
          <h3 className="text-center mb-4" style={{ color: '#7a3b45' }}>Budget Planner</h3>
          <Form onSubmit={handleSubmit}>
            {/* Monthly Income */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Monthly Income (₹)</Form.Label>
              <Form.Control
                type="number"
                value={income}
                onChange={(e) => setIncome(parseFloat(e.target.value || 0))}
                style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7' }}
                required
              />
            </Form.Group>

            {/* Desired Savings */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#7a3b45', fontWeight: '500' }}>Desired Savings (₹)</Form.Label>
              <Form.Control
                type="number"
                value={savings}
                onChange={(e) => setSavings(parseFloat(e.target.value || 0))}
                style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7' }}
                required
              />
            </Form.Group>

            <hr />
            <h6 style={{ color: '#7a3b45', fontWeight: '500' }}>Spending Categories</h6>

            {/* Category Inputs */}
            {categories.map((cat, index) => (
              <Row key={index} className="mb-3">
                <Col xs={6}>
                  <Form.Select
                    value={cat.name}
                    onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                    style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7' }}
                    required
                  >
                    <option value="">Select Category</option>
                    {predefinedCategories.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                    <option value="Other">Other</option>
                  </Form.Select>

                  {/* Custom category input if 'Other' selected */}
                  {cat.isCustom && (
                    <Form.Control
                      type="text"
                      placeholder="Enter custom category"
                      className="mt-2"
                      value={cat.customName}
                      onChange={(e) => handleCustomNameChange(index, e.target.value)}
                      required
                    />
                  )}
                </Col>

                <Col xs={6}>
                  <Form.Control
                    type="number"
                    placeholder="Amount (₹)"
                    value={cat.amount}
                    onChange={(e) => handleCategoryChange(index, 'amount', e.target.value)}
                    style={{ borderRadius: '12px', backgroundColor: '#d7b3b8e7' }}
                    required
                  />
                </Col>
              </Row>
            ))}

            {/* Add another category */}
            <div className="d-flex justify-content-end mb-3">
              <Button variant="outline-secondary" size="sm" onClick={handleAddCategory}>+ Add Category</Button>
            </div>

            {/* Submit button */}
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
              onMouseOver={(e) => (e.target.style.backgroundColor = '#af737ae4')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#d7b3b8e7')}
            >
              Generate Budget Summary
            </Button>
          </Form>
        </Card>

        {/* Budget Summary Display */}
        {showBudget && (
          <Card style={{ width: '100%', maxWidth: '600px', borderRadius: '20px', border: 'none', marginTop: '30px' }} className="shadow p-4 bg-white">
            <h4 className="mb-3" style={{ color: '#7a3b45' }}>Your Budget Summary</h4>
            <p><strong>Total Income:</strong> ₹{income}</p>
            <p><strong>Savings:</strong> ₹{savings}</p>
            <p><strong>Spendable Income (Income - Savings):</strong> ₹{spendable}</p>
            <p><strong>Total Allocated to Categories:</strong> ₹{totalAllocated}</p>
            <p><strong>Remaining:</strong> ₹{remainder >= 0 ? remainder : 0}</p>

            {/* Pie Chart Display */}
            <div className="mt-4">
              <h5 style={{ color: '#7a3b45' }}>Spending Distribution</h5>
              <Pie data={pieData} />
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default BudgetPlanner;
