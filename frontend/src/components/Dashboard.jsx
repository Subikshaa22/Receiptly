import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
  ResponsiveContainer
} from 'recharts';
import GaugeChart from 'react-gauge-chart';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc0cb'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [, setBudget] = useState(() => {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? parseFloat(saved) : 0;
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [budgetPlans, setBudgetPlans] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/analysis', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/budget', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Budget fetch failed: ${res.status}`);
        return res.json();
      })
      .then(b => {
        setBudget(b.budget);
        localStorage.setItem('monthlyBudget', b.budget);
      })
      .catch(err => console.error("Error loading budget:", err));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:5000/api/budgetplan/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBudgetPlans(data);
        } else {
          console.error('Unexpected budget plan format', data);
        }
      })
      .catch(err => console.error('Error fetching budget plans:', err));
  }, [token]);

  if (!data) return <p>Loading dashboard...</p>;

  const months = Object.keys(data.monthlyTrend).sort();
  const cats = Array.from(new Set(months.flatMap(m => Object.keys(data.monthlyTrend[m]))));
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthlyData = months.map(m => {
    const [, month] = m.split('-');
    const row = { month: monthNames[parseInt(month, 10) - 1] };
    cats.forEach(c => row[c] = data.monthlyTrend[m][c] || 0);
    return row;
  });

  const pieData = cats.map(c => ({ name: c, value: data.categoryPie[c] || 0 }));

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const heatData = weekdays.map(day => {
    const row = { day };
    cats.forEach(c => row[c] = data.weekdayHeat[day]?.[c] || 0);
    return row;
  });

  const totalSpent = Object.values(data.categoryPie).reduce((a, b) => a + b, 0);

  const handleChatSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'You', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ question: input.trim() })
      });
      const data = await res.json();
      const botMsg = { sender: 'BudgetBot', text: data.answer || 'No response' };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botMsg = { sender: 'BudgetBot', text: 'Error contacting chatbot' };
      setMessages(prev => [...prev, botMsg]);
      console.error(err);
    }
    setInput('');
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      padding: '2rem'
    }}>
      {/* Monthly Line Chart */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ color: '#7a3b45' }}>Monthly Spending Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {cats.map((c, i) => <Line key={c} dataKey={c} stroke={COLORS[i % COLORS.length]} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart by Category */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ color: '#7a3b45' }}>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
              {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Weekday Heatmap */}
      <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ color: '#7a3b45' }}>Weekday Spending Heatmap (Stacked Bar)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={heatData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            {cats.map((c, i) => <Bar key={c} dataKey={c} stackId="a" fill={COLORS[i % COLORS.length]} />)}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Budget Usage Gauges */}
      <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ color: '#7a3b45' }}>Budget Usage</h3>
        {budgetPlans.length > 0 && (() => {
          const latest = budgetPlans[0];
          const catTotal = latest.categories.reduce((sum, c) => sum + c.amount, 0);
          const savingsPercent = latest.income > 0 ? latest.savings / latest.income : 0;
          const spendingPercent = latest.income > 0 ? catTotal / latest.income : 0;

          return (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ width: '200px' }}>
                <GaugeChart
                  id="gauge-savings"
                  nrOfLevels={20}
                  percent={Math.min(savingsPercent, 1)}
                  colors={["#1890ff", "#ff4d4f"]}
                  arcWidth={0.3}
                  textColor="#000"
                />
                <p style={{ textAlign: 'center', color: '#7a3b45' }}>
                  Savings: {(savingsPercent * 100).toFixed(1)}%
                </p>
              </div>
              <div style={{ width: '200px' }}>
                <GaugeChart
                  id="gauge-spending"
                  nrOfLevels={20}
                  percent={Math.min(spendingPercent, 1)}
                  colors={["#faad14", "#ff4d4f"]}
                  arcWidth={0.3}
                  textColor="#000"
                />
                <p style={{ textAlign: 'center', color: '#7a3b45' }}>
                  Planned Spending: {(spendingPercent * 100).toFixed(1)}%
                </p>
              </div>
              {latest.categories.map((cat, idx) => {
                const catPercent = latest.income > 0 ? cat.amount / latest.income : 0;
                return (
                  <div key={idx} style={{ width: '200px', color: '#7a3b45' }}>
                    <GaugeChart
                      id={`gauge-cat-${idx}`}
                      nrOfLevels={20}
                      percent={Math.min(catPercent, 1)}
                      colors={["#52c41a", "#ff4d4f"]}
                      arcWidth={0.3}
                      textColor="#000"
                    />
                    <p style={{ textAlign: 'center' }}>
                      {cat.name}: {(catPercent * 100).toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })()}
        <p style={{ textAlign: 'center', color: '#7a3b45' }}>
          Total Spent: {totalSpent.toFixed(2)}
        </p>
      </div>

      {/* Chatbot Section */}
      <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3 style={{ color: '#7a3b45' }}>Analyser Assistant</h3>
        <div id="chatbox" style={{
          height: '200px',
          overflowY: 'auto',
          border: '1px solid #ddd',
          padding: '10px',
          marginBottom: '10px',
          background: '#fafafa'
        }}>
          {messages.map((m, i) => (
            <div key={i}>
              <strong>{m.sender}:</strong> {m.text}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your expenses..."
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '20px',
              border: '1px solid #7a3b45',
              outline: 'none',
              color: '#7a3b45'
            }}
          />
          <button
            onClick={handleChatSend}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: '#7a3b45',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
