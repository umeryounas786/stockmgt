const { getPool } = require('../config/database');

class StockPurchase {
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT sp.*,
               p.product_code, p.product_description, p.product_packet_size,
               p.supplier_id,
               s.supplier_code, s.supplier_name
        FROM stock_purchases sp
        JOIN products p ON p.product_id = sp.product_id
        JOIN suppliers s ON s.supplier_id = p.supplier_id
        ORDER BY sp.purchase_date DESC, sp.purchase_id DESC
      `);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getById(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT sp.*,
               p.product_code, p.product_description, p.product_packet_size,
               p.supplier_id,
               s.supplier_code, s.supplier_name
        FROM stock_purchases sp
        JOIN products p ON p.product_id = sp.product_id
        JOIN suppliers s ON s.supplier_id = p.supplier_id
        WHERE sp.purchase_id = ?
      `, [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async create({ productId, quantity, unitValue, currency, purchaseDate }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO stock_purchases (product_id, quantity, unit_value, currency, purchase_date)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, quantity, unitValue, currency, purchaseDate]
      );
      return { purchase_id: result.insertId };
    } finally {
      connection.release();
    }
  }

  static async update(id, { quantity, unitValue, currency, purchaseDate }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE stock_purchases
         SET quantity = ?, unit_value = ?, currency = ?, purchase_date = ?, updated_at = NOW()
         WHERE purchase_id = ?`,
        [quantity, unitValue, currency, purchaseDate, id]
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
      await connection.execute('DELETE FROM stock_purchases WHERE purchase_id = ?', [id]);
      return { success: true };
    } finally {
      connection.release();
    }
  }

  static async getTotalPurchasedForProduct(productId, excludePurchaseId = null) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      let sql = 'SELECT COALESCE(SUM(quantity), 0) AS total FROM stock_purchases WHERE product_id = ?';
      const params = [productId];
      if (excludePurchaseId) {
        sql += ' AND purchase_id <> ?';
        params.push(excludePurchaseId);
      }
      const [rows] = await connection.execute(sql, params);
      return Number(rows[0]?.total || 0);
    } finally {
      connection.release();
    }
  }

  static async getSoldForProduct(productId) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COALESCE(SUM(sale_qty), 0) AS sold FROM sales WHERE product_id = ?',
        [productId]
      );
      return Number(rows[0]?.sold || 0);
    } finally {
      connection.release();
    }
  }
}

module.exports = StockPurchase;
