const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images
// In server.js or app.js
app.use('/analysis_images', express.static(path.join(__dirname,  'public','analysis_images')));
const chatbotRoutes = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);

// Routes
const authRoutes = require('./routes/auth');
const receiptRoutes = require('./routes/receipts');
const ocrRoutes = require('./routes/ocr'); //  You missed this earlier

const analysisRoutes = require('./routes/analysis');
app.use('/api/analysis', analysisRoutes);

const budgetRoutes = require('./routes/budget');
app.use('/api/budget', budgetRoutes);

const budgetPlanRoutes = require('./routes/budgetplan');
app.use('/api/budgetplan', budgetPlanRoutes);

const calendarRoutes = require('./routes/calendar');
app.use('/api/spending', calendarRoutes);

// Serve dashboard.html at /dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});


app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/ocr', ocrRoutes); //  You missed this earlier

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected locally"))
  .catch(err => console.error(" DB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
