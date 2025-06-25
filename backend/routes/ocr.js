const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const Receipt = require('../models/Receipt');
const protect = require('../middleware/authMiddleware'); //  Import auth middleware
const router = express.Router();

// Upload config
const upload = multer({ dest: 'uploads/' });

// Secure the route
router.post('/', protect, upload.single('image'), (req, res) => {
  const imagePath = path.join(__dirname, '..', req.file.path);

  const python = spawn('python', ['receipt_ocr.py', '-i', imagePath]);

  let dataBuffer = '';
  let errorBuffer = '';

  python.stdout.on('data', (data) => {
    dataBuffer += data.toString();
  });

  python.stderr.on('data', (err) => {
    errorBuffer += err.toString();
  });

  python.on('close', async (code) => {
    if (errorBuffer) {
      console.error('Python Error:', errorBuffer);
      return res.status(500).json({ error: 'Python script error', details: errorBuffer });
    }

    try {
      const jsonData = JSON.parse(dataBuffer);
      jsonData.imageUrl = `/uploads/${req.file.filename}`;
      jsonData.user = req.user._id; //  Link to user

      const receipt = new Receipt(jsonData);
      await receipt.save();

      res.json(receipt);
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse OCR output', details: e.message });
    }
  });
});

module.exports = router;
