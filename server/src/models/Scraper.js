const mongoose = require('mongoose');

const scraperSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scraper name is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUrl: {
    type: String,
    required: [true, 'Target URL is required'],
    trim: true
  },
  selectors: [{
    name: {
      type: String,
      required: true
    },
    selector: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'attribute', 'html'],
      default: 'text'
    },
    attribute: {
      type: String,
      default: null
    }
  }],
  schedule: {
    active: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['once', 'hourly', 'daily', 'weekly'],
      default: 'once'
    },
    lastRun: {
      type: Date,
      default: null
    }
  },
  webhook: {
    active: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: null
    }
  },
  options: {
    waitForSelector: {
      type: String,
      default: null
    },
    timeout: {
      type: Number,
      default: 30000
    },
    pagination: {
      enabled: {
        type: Boolean,
        default: false
      },
      nextSelector: {
        type: String,
        default: null
      },
      maxPages: {
        type: Number,
        default: 1
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Scraper = mongoose.model('Scraper', scraperSchema);

module.exports = Scraper;
