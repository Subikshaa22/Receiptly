const express = require('express');
const router = express.Router();
const BudgetPlan = require('../models/BudgetPlan');

// Save budget plan
router.post('/save', async (req, res) => {
  try {
    const { income, savings, categories } = req.body;
    const plan = new BudgetPlan({ income, savings, categories });
    await plan.save();
    res.status(201).json({ message: 'Budget plan saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save budget plan.', error });
  }
});

// Get all saved plans
router.get('/all', async (req, res) => {
  try {
    const plans = await BudgetPlan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans.', error });
  }
});

module.exports = router;
