const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

// Middleware to protect routes that require JWT authentication
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Middleware to check API key authentication
exports.apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // Find user with this API key
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }
    
    // Check usage limits
    if (user.usageCount >= user.usageLimit) {
      return res.status(429).json({
        success: false,
        message: 'API usage limit exceeded'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to restrict access to admin only
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
