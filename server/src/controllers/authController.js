const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config/config');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

// Register a new user
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        role: user.role,
        webhookUrl: user.webhookUrl,
        usageLimit: user.usageLimit,
        usageCount: user.usageCount,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Regenerate API key
exports.regenerateApiKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Generate new API key
    const apiKey = user.generateApiKey();
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      apiKey
    });
  } catch (error) {
    next(error);
  }
};

// Update webhook URL
exports.updateWebhook = async (req, res, next) => {
  try {
    const { webhookUrl } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { webhookUrl },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      webhookUrl: user.webhookUrl
    });
  } catch (error) {
    next(error);
  }
};
