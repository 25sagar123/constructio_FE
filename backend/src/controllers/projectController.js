// Import models based on database type
const Project = process.env.MONGODB_URI ? 
  require('../models/Project') : 
  null; // MySQL Project model would need to be created similar to UserMySQL

// Get all projects
const getProjects = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      managerId,
      search 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    // Build filter
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (managerId) filter.manager = managerId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // If user is not admin, filter by their projects
    if (req.user.role !== 'admin') {
      filter.$or = [
        { manager: req.user.id },
        { 'teamMembers.user': req.user.id }
      ];
    }
    
    const projects = await Project.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });
      
    const total = await Project.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        projects,
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

// Get project by ID
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user has access to this project
    if (req.user.role !== 'admin') {
      const hasAccess = project.manager._id.toString() === req.user.id ||
        project.teamMembers.some(member => member.user._id.toString() === req.user.id);
        
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this project'
        });
      }
    }
    
    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

// Create new project
const createProject = async (req, res, next) => {
  try {
    const projectData = req.body;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    // Set the manager to the current user if not specified and user is manager/admin
    if (!projectData.manager && ['manager', 'admin'].includes(req.user.role)) {
      projectData.manager = req.user.id;
    }
    
    const project = await Project.create(projectData);
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to update this project
    if (req.user.role !== 'admin' && project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this project'
      });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    
    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });
  } catch (error) {
    next(error);
  }
};

// Delete project (soft delete)
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to delete this project
    if (req.user.role !== 'admin' && project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this project'
      });
    }
    
    await Project.findByIdAndUpdate(id, { isActive: false });
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add team member to project
const addTeamMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role = 'member' } = req.body;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to add team members
    if (req.user.role !== 'admin' && project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add team members to this project'
      });
    }
    
    await project.addTeamMember(userId, role);
    
    res.json({
      success: true,
      message: 'Team member added successfully',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

// Remove team member from project
const removeTeamMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if user has permission to remove team members
    if (req.user.role !== 'admin' && project.manager._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to remove team members from this project'
      });
    }
    
    await project.removeTeamMember(userId);
    
    res.json({
      success: true,
      message: 'Team member removed successfully',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

// Get projects by status
const getProjectsByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;
    
    if (!process.env.MONGODB_URI) {
      return res.status(501).json({
        success: false,
        message: 'Project management requires MongoDB configuration'
      });
    }
    
    const validStatuses = ['planning', 'active', 'completed', 'cancelled', 'on-hold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified'
      });
    }
    
    const filter = { status, isActive: true };
    
    // If user is not admin, filter by their projects
    if (req.user.role !== 'admin') {
      filter.$or = [
        { manager: req.user.id },
        { 'teamMembers.user': req.user.id }
      ];
    }
    
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getProjectsByStatus
};