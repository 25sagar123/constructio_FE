const bcrypt = require('bcryptjs');
const config = require('../config');

// In-memory storage for testing/demo purposes
let users = [];
let nextId = 1;

class InMemoryUserModel {
  // Create a new user
  static async create(userData) {
    const { firstName, lastName, email, password, role, phone, department } = userData;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
    
    const user = {
      id: nextId++,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'user',
      phone,
      department,
      isActive: true,
      lastLogin: null,
      profileImage: null,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(user);
    return user.id;
  }

  // Find user by email
  static async findByEmail(email) {
    return users.find(u => u.email === email && u.isActive);
  }

  // Find user by ID
  static async findById(id) {
    const user = users.find(u => u.id === parseInt(id) && u.isActive);
    if (user) {
      const { password, refreshToken, ...userWithoutSensitive } = user;
      return userWithoutSensitive;
    }
    return null;
  }

  // Find user by ID with password (for authentication)
  static async findByIdWithPassword(id) {
    return users.find(u => u.id === parseInt(id) && u.isActive);
  }

  // Update user
  static async update(id, updateData) {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date()
    };
    
    return this.findById(id);
  }

  // Delete user (soft delete)
  static async delete(id) {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex !== -1) {
      users[userIndex].isActive = false;
      users[userIndex].updatedAt = new Date();
    }
  }

  // Find all active users
  static async findAll(limit = 100, offset = 0) {
    return users
      .filter(u => u.isActive)
      .slice(offset, offset + limit)
      .map(user => {
        const { password, refreshToken, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
      });
  }

  // Find users by role
  static async findByRole(role) {
    return users
      .filter(u => u.role === role && u.isActive)
      .map(user => {
        const { password, refreshToken, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
      });
  }

  // Update last login
  static async updateLastLogin(id) {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date();
    }
  }

  // Update refresh token
  static async updateRefreshToken(id, refreshToken) {
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex !== -1) {
      users[userIndex].refreshToken = refreshToken;
    }
  }

  // Clear all users (for testing)
  static clearAll() {
    users = [];
    nextId = 1;
  }
}

module.exports = InMemoryUserModel;