const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  imageUrl: String,
  items: [{
    name: String,
    price: Number,
    category: String,
    quantity: Number
  }]
});

module.exports = mongoose.model('Receipt', receiptSchema);
