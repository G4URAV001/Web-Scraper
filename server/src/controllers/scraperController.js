const { validationResult } = require('express-validator');
const puppeteer = require('puppeteer');
const axios = require('axios');
const Scraper = require('../models/Scraper');
const ScrapedData = require('../models/ScrapedData');
const User = require('../models/User');
const config = require('../config/config');

// Create a new scraper configuration
exports.createScraper = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, targetUrl, selectors, schedule, webhook, options } = req.body;

    // Create new scraper
    const scraper = await Scraper.create({
      name,
      user: req.user._id,
      targetUrl,
      selectors,
      schedule: schedule || {},
      webhook: webhook || {},
      options: options || {}
    });

    res.status(201).json({
      success: true,
      data: scraper
    });
  } catch (error) {
    next(error);
  }
};

// Get all scrapers for a user
exports.getScrapers = async (req, res, next) => {
  try {
    const scrapers = await Scraper.find({ user: req.user._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: scrapers.length,
      data: scrapers
    });
  } catch (error) {
    next(error);
  }
};

// Get a single scraper
exports.getScraper = async (req, res, next) => {
  try {
    const scraper = await Scraper.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!scraper) {
      return res.status(404).json({
        success: false,
        message: 'Scraper not found'
      });
    }

    res.status(200).json({
      success: true,
      data: scraper
    });
  } catch (error) {
    next(error);
  }
};

// Update a scraper
exports.updateScraper = async (req, res, next) => {
  try {
    const { name, targetUrl, selectors, schedule, webhook, options } = req.body;

    let scraper = await Scraper.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!scraper) {
      return res.status(404).json({
        success: false,
        message: 'Scraper not found'
      });
    }

    scraper = await Scraper.findByIdAndUpdate(
      req.params.id,
      {
        name,
        targetUrl,
        selectors,
        schedule,
        webhook,
        options
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: scraper
    });
  } catch (error) {
    next(error);
  }
};

// Delete a scraper
exports.deleteScraper = async (req, res, next) => {
  try {
    const scraper = await Scraper.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!scraper) {
      return res.status(404).json({
        success: false,
        message: 'Scraper not found'
      });
    }

    await scraper.deleteOne();
    
    // Also delete associated scraped data
    await ScrapedData.deleteMany({ scraper: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Run a scraper
exports.runScraper = async (req, res, next) => {
  try {
    const scraper = await Scraper.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!scraper) {
      return res.status(404).json({
        success: false,
        message: 'Scraper not found'
      });
    }

    // Increment usage count
    await User.findByIdAndUpdate(req.user._id, { $inc: { usageCount: 1 } });

    // Start scraping process
    const startTime = Date.now();
    let browser;
    
    try {
      // Launch browser
      browser = await puppeteer.launch(config.puppeteerOptions);
      const page = await browser.newPage();
      
      // Set default timeout
      page.setDefaultTimeout(scraper.options.timeout || 30000);
      
      // Navigate to URL
      await page.goto(scraper.targetUrl, { waitUntil: 'networkidle2' });
      
      // Wait for selector if specified
      if (scraper.options.waitForSelector) {
        await page.waitForSelector(scraper.options.waitForSelector);
      }
      
      // Extract data based on selectors
      const extractedData = {};
      
      for (const selector of scraper.selectors) {
        try {
          let value;
          
          if (selector.type === 'text') {
            value = await page.$eval(selector.selector, el => el.textContent.trim());
          } else if (selector.type === 'attribute' && selector.attribute) {
            value = await page.$eval(selector.selector, (el, attr) => el.getAttribute(attr), selector.attribute);
          } else if (selector.type === 'html') {
            value = await page.$eval(selector.selector, el => el.innerHTML.trim());
          }
          
          extractedData[selector.name] = value;
        } catch (error) {
          extractedData[selector.name] = null;
        }
      }
      
      // Handle pagination if enabled
      if (scraper.options.pagination && scraper.options.pagination.enabled) {
        const paginationData = [];
        paginationData.push({ ...extractedData });
        
        let currentPage = 1;
        const maxPages = scraper.options.pagination.maxPages || 1;
        
        while (currentPage < maxPages) {
          try {
            // Check if next button exists
            const hasNextPage = await page.$(scraper.options.pagination.nextSelector);
            
            if (!hasNextPage) break;
            
            // Click next button
            await page.click(scraper.options.pagination.nextSelector);
            
            // Wait for navigation
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            
            // Extract data from new page
            const pageData = {};
            
            for (const selector of scraper.selectors) {
              try {
                let value;
                
                if (selector.type === 'text') {
                  value = await page.$eval(selector.selector, el => el.textContent.trim());
                } else if (selector.type === 'attribute' && selector.attribute) {
                  value = await page.$eval(selector.selector, (el, attr) => el.getAttribute(attr), selector.attribute);
                } else if (selector.type === 'html') {
                  value = await page.$eval(selector.selector, el => el.innerHTML.trim());
                }
                
                pageData[selector.name] = value;
              } catch (error) {
                pageData[selector.name] = null;
              }
            }
            
            paginationData.push(pageData);
            currentPage++;
          } catch (error) {
            break;
          }
        }
        
        // Save data with pagination
        const scrapedData = await ScrapedData.create({
          scraper: scraper._id,
          user: req.user._id,
          data: paginationData,
          url: scraper.targetUrl,
          status: 'success',
          executionTime: Date.now() - startTime
        });
        
        // Update last run time
        await Scraper.findByIdAndUpdate(scraper._id, {
          'schedule.lastRun': new Date()
        });
        
        // Send webhook if enabled
        if (scraper.webhook.active && scraper.webhook.url) {
          try {
            await axios.post(scraper.webhook.url, {
              scraper: scraper._id,
              data: paginationData,
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Webhook error:', error.message);
          }
        }
        
        res.status(200).json({
          success: true,
          data: scrapedData
        });
      } else {
        // Save data without pagination
        const scrapedData = await ScrapedData.create({
          scraper: scraper._id,
          user: req.user._id,
          data: extractedData,
          url: scraper.targetUrl,
          status: 'success',
          executionTime: Date.now() - startTime
        });
        
        // Update last run time
        await Scraper.findByIdAndUpdate(scraper._id, {
          'schedule.lastRun': new Date()
        });
        
        // Send webhook if enabled
        if (scraper.webhook.active && scraper.webhook.url) {
          try {
            await axios.post(scraper.webhook.url, {
              scraper: scraper._id,
              data: extractedData,
              timestamp: new Date()
            });
          } catch (error) {
            console.error('Webhook error:', error.message);
          }
        }
        
        res.status(200).json({
          success: true,
          data: scrapedData
        });
      }
    } catch (error) {
      // Save error data
      const scrapedData = await ScrapedData.create({
        scraper: scraper._id,
        user: req.user._id,
        data: {},
        url: scraper.targetUrl,
        status: 'failed',
        error: error.message,
        executionTime: Date.now() - startTime
      });
      
      res.status(500).json({
        success: false,
        message: 'Scraping failed',
        error: error.message,
        data: scrapedData
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    next(error);
  }
};

// Get scraped data for a scraper
exports.getScrapedData = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Check if scraper exists and belongs to user
    const scraper = await Scraper.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!scraper) {
      return res.status(404).json({
        success: false,
        message: 'Scraper not found'
      });
    }
    
    // Get scraped data
    const scrapedData = await ScrapedData.find({ scraper: req.params.id })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count
    const count = await ScrapedData.countDocuments({ scraper: req.params.id });
    
    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: scrapedData
    });
  } catch (error) {
    next(error);
  }
};
