// Routes for editable lumber/material prices.

const express = require('express');
const { getPrices, savePrices, DEFAULT_PRICES } = require('../services/storageService');

const router = express.Router();

// GET /api/prices -> fetch current price list.
router.get('/', (_req, res) => {
  res.json(getPrices());
});

// PUT /api/prices -> save manual Rona-style prices.
router.put('/', (req, res) => {
  const incoming = req.body || {};

  // Validate and sanitize numeric prices.
  const cleaned = {};

  for (const key of Object.keys(DEFAULT_PRICES)) {
    const value = Number(incoming[key]);

    if (!Number.isFinite(value) || value < 0) {
      return res.status(400).json({
        message: `Invalid price for ${key}. Please enter a positive number.`
      });
    }

    cleaned[key] = Math.round(value * 100) / 100;
  }

  savePrices(cleaned);
  return res.json(cleaned);
});

module.exports = router;
