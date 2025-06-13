const Receipt = require('../models/Receipt');
const { runOCR } = require('../utils/ocrHelper');

exports.uploadReceipt = async (req, res) => {
  try {
    const filePath = req.file.path;
    const { userId, date } = req.body;

    const items = await runOCR(filePath); // Python OCR

    const receipt = new Receipt({
      user: userId,
      date: new Date(date),
      imageUrl: filePath,
      items
    });

    await receipt.save();
    res.json({ message: ' Receipt saved', receipt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: ' Upload failed' });
  }
};

exports.getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.params.userId });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: ' Fetching receipts failed' });
  }
};
