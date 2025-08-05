// Import models based on database type
const User = process.env.MONGODB_URI ? 
  require('../models/User') : 
  process.env.MYSQL_HOST ? 
  require('../models/UserMySQL') :
  require('../models/InMemoryUser');

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, department } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let users;
    let total;
    
    if (process.env.MONGODB_URI) {
      // MongoDB query
      const filter = { isActive: true };
      if (role) filter.role = role;
      if (department) filter.department = department;
      
      users = await User.find(filter)
        .select('-refreshToken')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 });
        
      total = await User.countDocuments(filter);
    } else {
      // MySQL query - simplified for this example
      users = await User.findAll(limitNum, skip);
      total = users.length; // In a real app, you'd have a separate count query
    }
    
    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id || user._id,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.department,
          lastLogin: user.lastLogin || user.last_login,
          createdAt: user.createdAt || user.created_at
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let user;
    if (process.env.MONGODB_URI) {
      user = await User.findById(id);
    } else {
      user = await User.findById(id);
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
          createdAt: user.createdAt || user.created_at,
          updatedAt: user.updatedAt || user.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.email;
    delete updateData.role; // Role updates should be handled separately
    
    let user;
    if (process.env.MONGODB_URI) {
      user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });
    } else {
      user = await User.update(id, updateData);
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user.id || user._id,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          department: user.department
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (soft delete)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Don't allow users to delete themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    if (process.env.MONGODB_URI) {
      const user = await User.findByIdAndUpdate(id, { isActive: false });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } else {
      await User.delete(id);
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    let user;
    if (process.env.MONGODB_URI) {
      user = await User.findByIdAndUpdate(id, { role }, {
        new: true,
        runValidators: true
      });
    } else {
      user = await User.update(id, { role });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user.id || user._id,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get users by role
const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;
    
    if (!['user', 'manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    let users;
    if (process.env.MONGODB_URI) {
      users = await User.findByRole(role);
    } else {
      users = await User.findByRole(role);
    }
    
    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id || user._id,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          email: user.email,
          role: user.role,
          department: user.department
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getUsersByRole
};