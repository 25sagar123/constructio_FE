const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

// Import models based on database type
const User = process.env.MONGODB_URI ? 
  require('../models/User') : 
  process.env.MYSQL_HOST ? 
  require('../models/UserMySQL') :
  require('../models/InMemoryUser');

// Generate JWT tokens
const generateTokens = (userId, email, role) => {
  const payload = { id: userId, email, role };
  
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
  
  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRE
  });
  
  return { accessToken, refreshToken };
};

// Register new user
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, phone, department } = req.body;
    
    // Check if user already exists
    const existingUser = process.env.MONGODB_URI ?
      await User.findOne({ email }) :
      await User.findByEmail(email);
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    let newUser;
    if (process.env.MONGODB_URI) {
      // MongoDB
      newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        phone,
        department
      });
    } else {
      // MySQL or In-Memory
      const userId = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        phone,
        department
      });
      newUser = await User.findById(userId);
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      newUser.id || newUser._id,
      newUser.email,
      newUser.role
    );
    
    // Save refresh token
    if (process.env.MONGODB_URI) {
      newUser.refreshToken = refreshToken;
      await newUser.save();
    } else {
      await User.updateRefreshToken(newUser.id, refreshToken);
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id || newUser._id,
          firstName: newUser.firstName || newUser.first_name,
          lastName: newUser.lastName || newUser.last_name,
          email: newUser.email,
          role: newUser.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user with password
    let user;
    if (process.env.MONGODB_URI) {
      user = await User.findOne({ email }).select('+password');
    } else {
      user = await User.findByEmail(email);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check password
    let isPasswordValid;
    if (process.env.MONGODB_URI) {
      isPasswordValid = await user.matchPassword(password);
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user.id || user._id,
      user.email,
      user.role
    );
    
    // Update last login and refresh token
    if (process.env.MONGODB_URI) {
      user.lastLogin = new Date();
      user.refreshToken = refreshToken;
      await user.save();
    } else {
      await User.updateLastLogin(user.id);
      await User.updateRefreshToken(user.id, refreshToken);
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id || user._id,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh access token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET);
    
    // Find user
    let user;
    if (process.env.MONGODB_URI) {
      user = await User.findById(decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id || user._id,
      user.email,
      user.role
    );
    
    // Update refresh token
    if (process.env.MONGODB_URI) {
      user.refreshToken = newRefreshToken;
      await user.save();
    } else {
      await User.updateRefreshToken(user.id, newRefreshToken);
    }
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    next(error);
  }
};

// Logout user
const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Clear refresh token
    if (process.env.MONGODB_URI) {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
    } else {
      await User.updateRefreshToken(userId, null);
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    let user;
    if (process.env.MONGODB_URI) {
      user = await User.findById(userId);
    } else {
      user = await User.findById(userId);
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id || user._id,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.department,
          lastLogin: user.lastLogin || user.last_login,
          createdAt: user.createdAt || user.created_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};