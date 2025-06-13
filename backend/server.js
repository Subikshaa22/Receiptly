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

// Routes
const authRoutes = require('./routes/auth');         
const receiptRoutes = require('./routes/receipts'); 

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);

// MongoDB connection (cleaned version, no deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" MongoDB connected locally"))
  .catch(err => console.error(" DB Connection Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
