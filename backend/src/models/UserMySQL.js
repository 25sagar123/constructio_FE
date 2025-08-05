const { executeQuery } = require('../config/mysql');

class UserModel {
  // Create users table
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'manager', 'admin') DEFAULT 'user',
        phone VARCHAR(20),
        department VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        last_login DATETIME,
        profile_image VARCHAR(255),
        refresh_token VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_department (department)
      ) ENGINE=InnoDB
    `;
    
    await executeQuery(createTableQuery);
  }

  // Create a new user
  static async create(userData) {
    const { firstName, lastName, email, password, role, phone, department } = userData;
    
    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, password, role, phone, department)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(insertQuery, [
      firstName, lastName, email, password, role || 'user', phone, department
    ]);
    
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const selectQuery = `
      SELECT * FROM users WHERE email = ? AND is_active = TRUE
    `;
    
    const result = await executeQuery(selectQuery, [email]);
    return result[0];
  }

  // Find user by ID
  static async findById(id) {
    const selectQuery = `
      SELECT id, first_name, last_name, email, role, phone, department, 
             is_active, last_login, profile_image, created_at, updated_at
      FROM users WHERE id = ? AND is_active = TRUE
    `;
    
    const result = await executeQuery(selectQuery, [id]);
    return result[0];
  }

  // Find user by ID with password (for authentication)
  static async findByIdWithPassword(id) {
    const selectQuery = `
      SELECT * FROM users WHERE id = ? AND is_active = TRUE
    `;
    
    const result = await executeQuery(selectQuery, [id]);
    return result[0];
  }

  // Update user
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        // Convert camelCase to snake_case
        const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        fields.push(`${dbField} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) return null;
    
    values.push(id);
    
    const updateQuery = `
      UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, values);
    return this.findById(id);
  }

  // Delete user (soft delete)
  static async delete(id) {
    const deleteQuery = `
      UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(deleteQuery, [id]);
  }

  // Find all active users
  static async findAll(limit = 100, offset = 0) {
    const selectQuery = `
      SELECT id, first_name, last_name, email, role, phone, department,
             is_active, last_login, profile_image, created_at, updated_at
      FROM users WHERE is_active = TRUE
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    return await executeQuery(selectQuery, [limit, offset]);
  }

  // Find users by role
  static async findByRole(role) {
    const selectQuery = `
      SELECT id, first_name, last_name, email, role, phone, department,
             is_active, last_login, profile_image, created_at, updated_at
      FROM users WHERE role = ? AND is_active = TRUE
    `;
    
    return await executeQuery(selectQuery, [role]);
  }

  // Update last login
  static async updateLastLogin(id) {
    const updateQuery = `
      UPDATE users SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [id]);
  }

  // Update refresh token
  static async updateRefreshToken(id, refreshToken) {
    const updateQuery = `
      UPDATE users SET refresh_token = ?
      WHERE id = ?
    `;
    
    await executeQuery(updateQuery, [refreshToken, id]);
  }
}

module.exports = UserModel;