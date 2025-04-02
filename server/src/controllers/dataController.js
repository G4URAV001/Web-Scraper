const ScrapedData = require('../models/ScrapedData');
const Scraper = require('../models/Scraper');
const { Parser } = require('json2csv');

// Export data to CSV
exports.exportToCsv = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if data exists and belongs to user
    const scrapedData = await ScrapedData.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!scrapedData) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }
    
    // Get the data
    const data = scrapedData.data;
    
    // Handle array or object data
    let csvData;
    if (Array.isArray(data)) {
      csvData = data;
    } else {
      csvData = [data];
    }
    
    // Get fields from the first item
    const fields = Object.keys(csvData[0] || {});
    
    // Parse to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=data-${id}.csv`);
    
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// Export data to JSON
exports.exportToJson = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if data exists and belongs to user
    const scrapedData = await ScrapedData.findOne({
      _id: id,
      user: req.user._id
    });
    
    if (!scrapedData) {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=data-${id}.json`);
    
    res.status(200).json(scrapedData.data);
  } catch (error) {
    next(error);
  }
};

// Get visualization data
exports.getVisualizationData = async (req, res, next) => {
  try {
    const { scraperId } = req.params;
    
    // Check if scraper exists and belongs to user
    const scraper = await Scraper.findOne({
      _id: scraperId,
      user: req.user._id
    });
    
    if (!scraper) {
      return res.status(404).json({
        success: false,
        message: 'Scraper not found'
      });
    }
    
    // Get all scraped data for this scraper
    const scrapedData = await ScrapedData.find({ 
      scraper: scraperId,
      status: 'success'
    }).sort('createdAt');
    
    // Prepare data for visualization
    const labels = scrapedData.map(data => 
      new Date(data.createdAt).toLocaleDateString()
    );
    
    // Get first selector name for default visualization
    const firstSelectorName = scraper.selectors[0]?.name || 'data';
    
    // Extract data for the first selector
    const dataPoints = scrapedData.map(data => {
      if (Array.isArray(data.data)) {
        // For paginated data, count occurrences
        return data.data.length;
      } else {
        // For single data point, use the value if it's a number
        const value = data.data[firstSelectorName];
        return typeof value === 'number' ? value : 1;
      }
    });
    
    // Get execution times
    const executionTimes = scrapedData.map(data => data.executionTime);
    
    res.status(200).json({
      success: true,
      visualization: {
        labels,
        datasets: [
          {
            label: 'Data Points',
            data: dataPoints,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Execution Time (ms)',
            data: executionTimes,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};
