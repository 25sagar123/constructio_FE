const config = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  
  // Frontend URL for CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI,
  
  // MySQL Configuration
  MYSQL_HOST: process.env.MYSQL_HOST,
  MYSQL_PORT: process.env.MYSQL_PORT || 3306,
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // File Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
  
  // Email Configuration (for future use)
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
};

// Validation for required environment variables
const validateConfig = () => {
  const requiredVars = ['JWT_SECRET'];
  
  const missingVars = requiredVars.filter(varName => !config[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
    console.warn('⚠️  Using default values for development');
  }
  
  if (config.NODE_ENV === 'production') {
    const productionRequiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missingProdVars = productionRequiredVars.filter(varName => 
      !process.env[varName.replace('JWT_', '').replace('_', '')]
    );
    
    if (missingProdVars.length > 0) {
      throw new Error(`Production requires these environment variables: ${missingProdVars.join(', ')}`);
    }
  }
};

// Validate configuration on load
validateConfig();

module.exports = config;