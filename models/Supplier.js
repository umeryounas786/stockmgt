const { getPool } = require('../config/database');

class Supplier {
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT s.*, COALESCE(p.cnt, 0) AS product_count
        FROM suppliers s
        LEFT JOIN (
          SELECT supplier_id, COUNT(*) AS cnt
          FROM products
          GROUP BY supplier_id
        ) p ON p.supplier_id = s.supplier_id
        ORDER BY s.supplier_name ASC
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
      const [rows] = await connection.execute('SELECT * FROM suppliers WHERE supplier_id = ?', [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async create({ code, name, contactPerson, contactEmail, contactPhone, address }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO suppliers (supplier_code, supplier_name, contact_person, contact_email, contact_phone, address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [code, name, contactPerson, contactEmail, contactPhone, address]
      );
      return { supplier_id: result.insertId };
    } finally {
      connection.release();
    }
  }

  static async update(id, { code, name, contactPerson, contactEmail, contactPhone, address }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE suppliers
         SET supplier_code = ?, supplier_name = ?, contact_person = ?,
             contact_email = ?, contact_phone = ?, address = ?, updated_at = NOW()
         WHERE supplier_id = ?`,
        [code, name, contactPerson, contactEmail, contactPhone, address, id]
      );
      return { success: true };
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM suppliers WHERE supplier_id = ?', [id]);
      return { success: true };
    } finally {
      connection.release();
    }
  }

  static async getProductCount(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS cnt FROM products WHERE supplier_id = ?',
        [id]
      );
      return rows[0] ? Number(rows[0].cnt) : 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = Supplier;
