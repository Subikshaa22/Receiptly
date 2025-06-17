const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  month: String, // e.g. "2025-06"
  amount: Number
});

module.exports = mongoose.model('Budget', budgetSchema);
