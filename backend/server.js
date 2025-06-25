const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ------------------------ MIDDLEWARE ------------------------
app.use(cors());
app.use(express.json());

// Serve static files (images, analysis output)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/analysis_images', express.static(path.join(__dirname, 'public', 'analysis_images')));

// ------------------------ ROUTES ------------------------
// Auth and User
app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/user'));

// OCR and Receipts
app.use('/api/ocr', require('./routes/ocr'));
app.use('/api/receipts', require('./routes/receipts'));

// Budget-related
app.use('/api/budget', require('./routes/budget'));
app.use('/api/budgetplan', require('./routes/budgetplan'));

// Analysis and Calendar
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/spending', require('./routes/calendar'));

// Chatbot (optional/bonus feature)
app.use('/api/chatbot', require('./routes/chatbot'));

// Serve HTML page (if needed)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// ------------------------ MONGODB CONNECTION ------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected successfully"))
  .catch(err => console.error(" MongoDB connection error:", err));

// ------------------------ START SERVER ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running at http://localhost:${PORT}`));
