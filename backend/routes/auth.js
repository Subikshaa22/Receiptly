const express = require("express");
const router = express.Router();

// Dummy auth routes
router.post("/login", (req, res) => {
  res.json({ message: "Login route (not implemented)" });
});

router.post("/register", (req, res) => {
  res.json({ message: "Register route (not implemented)" });
});

module.exports = router;
