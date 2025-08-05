const mysql = require('mysql2/promise');

let pool = null;

const connectMySQL = async () => {
  try {
    // Create connection pool
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    });

    // Test the connection
    const connection = await pool.getConnection();
    console.log(`MySQL Connected: ${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT || 3306}`);
    connection.release();

    // Graceful close on app termination
    process.on('SIGINT', async () => {
      if (pool) {
        await pool.end();
        console.log('MySQL connection pool closed through app termination');
      }
    });

    return pool;
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('MySQL pool not initialized. Call connectMySQL() first.');
  }
  return pool;
};

const executeQuery = async (query, params = []) => {
  try {
    const connection = await getPool().getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();
    return results;
  } catch (error) {
    console.error('MySQL query error:', error.message);
    throw error;
  }
};

module.exports = {
  connectMySQL,
  getPool,
  executeQuery
};