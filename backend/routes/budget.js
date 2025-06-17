const express = require('express');
const Budget = require('../models/Budget');
const router = express.Router();

router.get('/:month', async (req, res) => {
  const { month } = req.params;
  const budget = await Budget.findOne({ month });
  res.json({ amount: budget?.amount || 0 });
});

router.post('/', async (req, res) => {
  const { month, amount } = req.body;
  let budget = await Budget.findOne({ month });
  if (budget) {
    budget.amount = amount;
  } else {
    budget = new Budget({ month, amount });
  }
  await budget.save();
  res.json({ success: true });
});

module.exports = router;
