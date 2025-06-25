const express = require('express');
const router = express.Router();
const BudgetPlan = require('../models/BudgetPlan');
const protect = require('../middleware/authMiddleware');

router.post('/save', protect, async (req, res) => {
  try {
    const { income, savings, categories } = req.body;
    const plan = new BudgetPlan({ user: req.user._id, income, savings, categories });
    await plan.save();
    res.status(201).json({ message: 'Budget plan saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save budget plan.', error });
  }
});

router.get('/all', protect, async (req, res) => {
  try {
    const plans = await BudgetPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans.', error });
  }
});

module.exports = router;
