const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit_price: Number,
  total_price: Number,
  category: String,
});

const ReceiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  merchant_name: String,
  address: String,
  date: String,
  total_amount: Number,
  subtotal: Number,
  tax_amount: Number,
  discounts: Number,
  payment_method: String,
  transaction_id: String,
  total_items: Number,
  items: [ItemSchema],
  imageUrl: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Receipt', ReceiptSchema);
