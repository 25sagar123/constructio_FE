// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

// Set test timeout
jest.setTimeout(30000);

// Clear in-memory database before each test
beforeEach(() => {
  // Only clear if using in-memory database
  if (!process.env.MONGODB_URI && !process.env.MYSQL_HOST) {
    const InMemoryUser = require('../src/models/InMemoryUser');
    InMemoryUser.clearAll();
  }
});