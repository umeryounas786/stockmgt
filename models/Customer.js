const { getPool } = require('../config/database');

class Customer {
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT c.*, COALESCE(s.cnt, 0) AS sale_count
        FROM customers c
        LEFT JOIN (
          SELECT customer_id, COUNT(*) AS cnt
          FROM sales
          WHERE customer_id IS NOT NULL
          GROUP BY customer_id
        ) s ON s.customer_id = c.customer_id
        ORDER BY c.customer_name ASC
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
      const [rows] = await connection.execute('SELECT * FROM customers WHERE customer_id = ?', [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async create({ name, contactPerson, contactEmail, contactPhone, address }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO customers (customer_name, contact_person, contact_email, contact_phone, address)
         VALUES (?, ?, ?, ?, ?)`,
        [name, contactPerson, contactEmail, contactPhone, address]
      );
      return { customer_id: result.insertId };
    } finally {
      connection.release();
    }
  }

  static async update(id, { name, contactPerson, contactEmail, contactPhone, address }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE customers
         SET customer_name = ?, contact_person = ?, contact_email = ?,
             contact_phone = ?, address = ?, updated_at = NOW()
         WHERE customer_id = ?`,
        [name, contactPerson, contactEmail, contactPhone, address, id]
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
      await connection.execute('DELETE FROM customers WHERE customer_id = ?', [id]);
      return { success: true };
    } finally {
      connection.release();
    }
  }
}

module.exports = Customer;
