const mongoose = require('mongoose');

const scrapedDataSchema = new mongoose.Schema({
  scraper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scraper',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success'
  },
  error: {
    type: String,
    default: null
  },
  executionTime: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
scrapedDataSchema.index({ scraper: 1, createdAt: -1 });
scrapedDataSchema.index({ user: 1, createdAt: -1 });

const ScrapedData = mongoose.model('ScrapedData', scrapedDataSchema);

module.exports = ScrapedData;
