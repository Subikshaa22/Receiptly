const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadReceipt, getReceipts } = require('../controllers/receiptController');

const router = express.Router();

// Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Routes
router.post('/upload', upload.single('receipt'), uploadReceipt);
router.get('/:userId', getReceipts);

module.exports = router;
