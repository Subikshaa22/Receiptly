const express = require('express');
const Receipt = require('../models/Receipt');
const router = express.Router();

// Helper: Convert YYYY-MM-DD → DD/MM/YYYY
function convertToDDMMYYYY(dateStr) {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}/${mm}/${yyyy}`;
}

router.get('/', async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Date query parameter is required (e.g., ?date=2024-07-05)' });
  }

  const formattedDate = convertToDDMMYYYY(date);

  try {
    const receipts = await Receipt.find({ date: formattedDate });
    res.json(receipts);
  } catch (err) {
    console.error('Error fetching receipts by date:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
