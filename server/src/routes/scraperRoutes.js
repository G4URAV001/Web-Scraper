const express = require('express');
const { check } = require('express-validator');
const scraperController = require('../controllers/scraperController');
const { protect, apiKeyAuth } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create a new scraper
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('targetUrl', 'Valid target URL is required').isURL(),
    check('selectors', 'At least one selector is required').isArray({ min: 1 })
  ],
  scraperController.createScraper
);

// Get all scrapers
router.get('/', scraperController.getScrapers);

// Get a single scraper
router.get('/:id', scraperController.getScraper);

// Update a scraper
router.put('/:id', scraperController.updateScraper);

// Delete a scraper
router.delete('/:id', scraperController.deleteScraper);

// Run a scraper
router.post('/:id/run', scraperController.runScraper);

// Get scraped data for a scraper
router.get('/:id/data', scraperController.getScrapedData);

// API routes (accessible with API key)
router.post(
  '/api/run',
  apiKeyAuth,
  [
    check('targetUrl', 'Valid target URL is required').isURL(),
    check('selectors', 'At least one selector is required').isArray({ min: 1 })
  ],
  scraperController.runScraper
);

module.exports = router;
