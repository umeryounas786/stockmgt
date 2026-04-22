const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(username, email, password) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      const result = await connection.execute(query, [username, email, hashedPassword]);
      
      connection.release();
      return { id: result[0].insertId, username, email };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM users WHERE username = ?';
      const [rows] = await connection.execute(query, [username]);
      
      connection.release();
      return rows[0] || null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  static async validatePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;
