const express = require('express');
const dataController = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Export data to CSV
router.get('/export/csv/:id', dataController.exportToCsv);

// Export data to JSON
router.get('/export/json/:id', dataController.exportToJson);

// Get visualization data
router.get('/visualization/:scraperId', dataController.getVisualizationData);

module.exports = router;
