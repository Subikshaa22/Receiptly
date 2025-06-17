const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Receipt = require('../models/Receipt');  // Assuming you have this model
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

router.post('/', async (req, res) => {
  const { question } = req.body;

  try {
    // Fetch all receipts (or filter if you want to limit)
    const receipts = await Receipt.find();

    // Prepare data summary
    let receiptSummary = receipts.map(r => {
      return {
        merchant: r.merchant_name,
        total: r.total_amount,
        date: r.date,
        items: r.items.map(i => `${i.name} (${i.category}): ${i.total_price}`).join(', ')
      };
    });

    // Convert to string for prompt
    const receiptText = JSON.stringify(receiptSummary, null, 2);

    const prompt = `
You are a smart money management assistant. Based on the following data of user's receipts, answer this question:
Question: ${question}
Data:
${receiptText}
Respond in a helpful, human-like tone.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.candidates[0].content.parts[0].text;

    res.json({ answer: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error processing chatbot request' });
  }
});

module.exports = router;
