const express = require('express');
const router = express.Router();

// Import controllers
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getUsersByRole
} = require('../controllers/userController');

// Import middleware
const { authenticate, authorize } = require('../middleware/auth');
const { validate, userSchemas, idSchema } = require('../middleware/validation');

/**
 * @route   GET /api/users
 * @desc    Get all users (with pagination)
 * @access  Private - Manager/Admin only
 */
router.get('/', authenticate, authorize('manager', 'admin'), getUsers);

/**
 * @route   GET /api/users/role/:role
 * @desc    Get users by role
 * @access  Private - Manager/Admin only
 */
router.get('/role/:role', authenticate, authorize('manager', 'admin'), getUsersByRole);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private - Manager/Admin only or own profile
 */
router.get('/:id', authenticate, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private - Manager/Admin only or own profile
 */
router.put('/:id', 
  authenticate, 
  validate(userSchemas.update), 
  updateUser
);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Private - Admin only
 */
router.put('/:id/role', 
  authenticate, 
  authorize('admin'), 
  updateUserRole
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private - Admin only
 */
router.delete('/:id', 
  authenticate, 
  authorize('admin'), 
  deleteUser
);

module.exports = router;