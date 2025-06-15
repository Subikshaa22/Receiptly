const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');

// GET all receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await Receipt.find();
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// POST a new receipt (if needed for testing without OCR)
router.post('/', async (req, res) => {
  try {
    const receipt = new Receipt(req.body);
    await receipt.save();
    res.status(201).json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save receipt' });
  }
});

module.exports = router;
