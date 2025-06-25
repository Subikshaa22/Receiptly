const express = require('express');
const Budget = require('../models/Budget');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); //  add this

router.get('/:month', protect, async (req, res) => {
  const { month } = req.params;
  const budget = await Budget.findOne({ month, user: req.user._id });
  res.json({ amount: budget?.amount || 0 });
});

router.post('/', protect, async (req, res) => {
  const { month, amount } = req.body;
  let budget = await Budget.findOne({ month, user: req.user._id });

  if (budget) {
    budget.amount = amount;
  } else {
    budget = new Budget({ month, amount, user: req.user._id });
  }
  await budget.save();
  res.json({ success: true });
});

module.exports = router;
