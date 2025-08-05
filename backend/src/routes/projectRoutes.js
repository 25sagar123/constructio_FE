const express = require('express');
const router = express.Router();

// Import controllers
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getProjectsByStatus
} = require('../controllers/projectController');

// Import middleware
const { authenticate, authorize } = require('../middleware/auth');
const { validate, projectSchemas, idSchema } = require('../middleware/validation');

/**
 * @route   GET /api/projects
 * @desc    Get all projects (with filtering and pagination)
 * @access  Private
 */
router.get('/', authenticate, getProjects);

/**
 * @route   GET /api/projects/status/:status
 * @desc    Get projects by status
 * @access  Private
 */
router.get('/status/:status', authenticate, getProjectsByStatus);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Private
 */
router.get('/:id', authenticate, getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private - Manager/Admin only
 */
router.post('/', 
  authenticate, 
  authorize('manager', 'admin'), 
  validate(projectSchemas.create), 
  createProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private - Project manager or Admin only
 */
router.put('/:id', 
  authenticate, 
  validate(projectSchemas.update), 
  updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (soft delete)
 * @access  Private - Project manager or Admin only
 */
router.delete('/:id', authenticate, deleteProject);

/**
 * @route   POST /api/projects/:id/team
 * @desc    Add team member to project
 * @access  Private - Project manager or Admin only
 */
router.post('/:id/team', authenticate, addTeamMember);

/**
 * @route   DELETE /api/projects/:id/team/:userId
 * @desc    Remove team member from project
 * @access  Private - Project manager or Admin only
 */
router.delete('/:id/team/:userId', authenticate, removeTeamMember);

module.exports = router;