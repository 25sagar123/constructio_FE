const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [200, 'Project name cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  actualCost: {
    type: Number,
    default: 0,
    min: [0, 'Actual cost cannot be negative']
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled', 'on-hold'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project manager is required']
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      default: 'member'
    },
    joinedDate: {
      type: Date,
      default: Date.now
    }
  }],
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  milestones: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    dueDate: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project duration in days
projectSchema.virtual('duration').get(function() {
  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for budget utilization percentage
projectSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget || this.budget === 0) return 0;
  return Math.round((this.actualCost / this.budget) * 100);
});

// Virtual for team size
projectSchema.virtual('teamSize').get(function() {
  return this.teamMembers.length + 1; // +1 for manager
});

// Indexes for better query performance
projectSchema.index({ status: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ startDate: 1, endDate: 1 });
projectSchema.index({ 'teamMembers.user': 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ tags: 1 });

// Populate manager and team members by default
projectSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'manager',
    select: 'firstName lastName email role'
  }).populate({
    path: 'teamMembers.user',
    select: 'firstName lastName email role'
  });
  next();
});

// Static method to find active projects
projectSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find projects by status
projectSchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true });
};

// Static method to find projects by manager
projectSchema.statics.findByManager = function(managerId) {
  return this.find({ manager: managerId, isActive: true });
};

// Instance method to add team member
projectSchema.methods.addTeamMember = function(userId, role = 'member') {
  const existingMember = this.teamMembers.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.teamMembers.push({
      user: userId,
      role,
      joinedDate: new Date()
    });
  }
  
  return this.save();
};

// Instance method to remove team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.teamMembers = this.teamMembers.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  return this.save();
};

module.exports = mongoose.model('Project', projectSchema);