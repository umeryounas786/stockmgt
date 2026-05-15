const { getPool } = require('../config/database');

class Company {
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT c.*, COALESCE(p.cnt, 0) AS product_count
        FROM company c
        LEFT JOIN (
          SELECT company_id, COUNT(*) AS cnt
          FROM products
          GROUP BY company_id
        ) p ON p.company_id = c.company_id
        ORDER BY c.company_name ASC
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getById(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM company WHERE company_id = ?', [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async create(companyCode, companyName) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO company (company_code, company_name) VALUES (?, ?)',
        [companyCode, companyName]
      );
      return { company_id: result.insertId, company_code: companyCode, company_name: companyName };
    } finally {
      connection.release();
    }
  }

  static async update(id, companyCode, companyName) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE company SET company_code = ?, company_name = ?, updated_at = NOW() WHERE company_id = ?',
        [companyCode, companyName, id]
      );
      return { success: true, message: 'Company updated' };
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM company WHERE company_id = ?', [id]);
      return { success: true, message: 'Company deleted' };
    } finally {
      connection.release();
    }
  }

  static async getProductCount(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS cnt FROM products WHERE company_id = ?',
        [id]
      );
      return rows[0] ? Number(rows[0].cnt) : 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = Company;
