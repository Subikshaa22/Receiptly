const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');

router.get('/', async (req, res) => {
  try {
    const receipts = await Receipt.find().lean();
    const monthlyTrend = {}, categoryPie = {}, weekdayHeat = {};
    let totalSpent = 0;

    receipts.forEach(r => {
      const d = new Date(r.uploadedAt);
      const month = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const day = d.toLocaleString('en-US', { weekday: 'long' });

      (r.items || []).forEach(item => {
        const cat = item.category || 'Other';
        const price = parseFloat(item.total_price) || 0;
        totalSpent += price;

        monthlyTrend[month] ??= {};
        monthlyTrend[month][cat] = (monthlyTrend[month][cat] || 0) + price;

        categoryPie[cat] = (categoryPie[cat] || 0) + price;

        weekdayHeat[day] ??= {};
        weekdayHeat[day][cat] = (weekdayHeat[day][cat] || 0) + price;
      });
    });

    res.json({ monthlyTrend, categoryPie, weekdayHeat, totalSpent });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
