const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Mock auth middleware (replace with JWT or session)
const getUser = async (req, res, next) => {
  // For demo, hard-code user ID
  const user = await User.findOne(); 
  if (!user) return res.status(404).json({ error: 'User not found' });
  req.user = user;
  next();
};

// Get budget
router.get('/budget', getUser, (req, res) => {
  res.json({ budget: req.user.budget });
});

// Update budget
router.post('/budget', getUser, async (req, res) => {
  const { budget } = req.body;
  if (typeof budget !== 'number') return res.status(400).json({ error: 'Invalid budget' });

  req.user.budget = budget;
  await req.user.save();
  res.json({ success: true, budget });
});

module.exports = router;
