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
  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('monthlyBudget');
    return saved ? parseFloat(saved) : 0;
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/analysis')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return <p>Loading dashboard...</p>;

  const months = Object.keys(data.monthlyTrend).sort();
  const cats = Array.from(new Set(months.flatMap(m => Object.keys(data.monthlyTrend[m]))));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];



const monthlyData = months.map(m => {
  // eslint-disable-next-line no-unused-vars
  const [year, month] = m.split('-');  // e.g., "2024-03" → ["2024", "03"]
  const row = { 
    month: monthNames[parseInt(month, 10) - 1]  // Convert "03" → March
  };
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
  const usedPercent = budget > 0 ? totalSpent / budget : 0;

  const topCategories = [...cats]
    .sort((a, b) => (data.categoryPie[b] || 0) - (data.categoryPie[a] || 0))
    .slice(0, 3);

  let biggestDay = '';
  let biggestDayAmt = 0;
  for (const [day, catData] of Object.entries(data.weekdayHeat)) {
    const dayTotal = Object.values(catData).reduce((a, b) => a + b, 0);
    if (dayTotal > biggestDayAmt) {
      biggestDayAmt = dayTotal;
      biggestDay = day;
    }
  }

  const handleBudgetChange = (e) => {
    const val = parseFloat(e.target.value);
    setBudget(val);
    localStorage.setItem('monthlyBudget', val);
  };
  // eslint-disable-next-line
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('receipt', file);

    fetch('http://localhost:5000/api/upload-receipt', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      console.log('Receipt data:', data);
      // optionally update dashboard state
    })
    .catch(err => console.error('Upload error', err));
  };

  const handleChatSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'You', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input.trim() })
      });
      const data = await res.json();

      const botMsg = { sender: 'Gemini', text: data.answer || 'No response' };
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      const botMsg = { sender: 'Gemini', text: 'Error contacting chatbot' };
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
      {/* Monthly Trend */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3>Monthly Spending Trend</h3>
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

      {/* Pie Chart */}
      <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
              {pieData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div style={{ gridColumn: '1 / -1', background: '#fff', padding: '1rem', borderRadius: '8px' }}>
        <h3>Weekday Spending Heatmap (Stacked Bar)</h3>
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

      {/* Budget + Summary section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        <div style={{ background: '#fff', padding: '1rem', borderRadius: '10px' }}>
          <h3>Budget Usage</h3>
          <p>
            Monthly Budget:
            <input 
              type="number"
              value={budget}
              onChange={handleBudgetChange}
              style={{ marginLeft: '0.5rem', width: '100px' }}
            />
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '180px',
            overflow: 'hidden'
          }}>
            <GaugeChart
              id="gauge-chart"
              nrOfLevels={20}
              percent={Math.min(usedPercent, 1)}
              colors={["#52c41a", "#ff4d4f"]}
              arcWidth={0.3}
              textColor="#000"
              style={{ width: '100%', maxWidth: '200px' }}
            />
          </div>
          <p style={{ textAlign: 'center' }}>
            {(usedPercent * 100).toFixed(1)}% of budget used
          </p>
          <p style={{ textAlign: 'center' }}>
            Total Spent: {totalSpent.toFixed(2)}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
            <h4>Top 3 Categories</h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
              {topCategories.map(cat => (
                <li key={cat}>
                  {cat}: {data.categoryPie[cat].toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px' }}>
            <h4>Biggest Spending Day</h4>
            <p>{biggestDay}: {biggestDayAmt.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <div style={{
        gridColumn: '1 / -1',
        background: '#fff',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <h3>💬 Analyser Assistant</h3>

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
            style={{ flex: 1, padding: '8px' }}
          />
          <button onClick={handleChatSend} style={{ padding: '8px 12px' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
