const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: String,
  amount: Number
});

const budgetPlanSchema = new mongoose.Schema({
  income: Number,
  savings: Number,
  categories: [categorySchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BudgetPlan', budgetPlanSchema);
