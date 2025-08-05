const {
  capitalize,
  generateRandomString,
  formatDate,
  daysBetween,
  isValidEmail,
  sanitizeInput,
  getPaginationMeta,
  camelToSnake,
  snakeToCamel,
  createResponse
} = require('../../src/utils/helpers');

describe('Helper Functions', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('tEST')).toBe('Test');
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of specified length', () => {
      const result = generateRandomString(10);
      expect(result).toHaveLength(10);
      expect(typeof result).toBe('string');
    });

    it('should generate different strings each time', () => {
      const str1 = generateRandomString(10);
      const str2 = generateRandomString(10);
      expect(str1).not.toBe(str2);
    });
  });

  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(formatDate(date)).toBe('2023-12-25');
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      const start = new Date('2023-01-01');
      const end = new Date('2023-01-10');
      expect(daysBetween(start, end)).toBe(9);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('missing@.com')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize dangerous characters', () => {
      expect(sanitizeInput('  <script>alert("xss")</script>  ')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('normal text')).toBe('normal text');
    });
  });

  describe('getPaginationMeta', () => {
    it('should generate correct pagination metadata', () => {
      const meta = getPaginationMeta(2, 10, 25);
      expect(meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        pages: 3,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 3,
        prevPage: 1
      });
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('firstName')).toBe('first_name');
      expect(camelToSnake('createdAt')).toBe('created_at');
      expect(camelToSnake('simple')).toBe('simple');
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('first_name')).toBe('firstName');
      expect(snakeToCamel('created_at')).toBe('createdAt');
      expect(snakeToCamel('simple')).toBe('simple');
    });
  });

  describe('createResponse', () => {
    it('should create standardized response object', () => {
      const response = createResponse(true, 'Success', { id: 1 }, { page: 1 });
      expect(response).toEqual({
        success: true,
        message: 'Success',
        data: { id: 1 },
        meta: { page: 1 }
      });
    });

    it('should handle null data and meta', () => {
      const response = createResponse(false, 'Error');
      expect(response).toEqual({
        success: false,
        message: 'Error'
      });
    });
  });
});