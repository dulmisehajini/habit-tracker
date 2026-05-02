const express = require('express');
const router = express.Router();

// placeholder for now - we build this properly on Day 3
router.get('/', (req, res) => {
  res.json({ message: 'Auth routes coming on Day 3!' });
});

module.exports = router;