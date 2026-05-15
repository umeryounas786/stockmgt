const { getPool } = require('../config/database');

class Sale {
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT s.*,
               p.product_code, p.product_description, p.supplier_id,
               sup.supplier_code, sup.supplier_name,
               c.customer_name
        FROM sales s
        JOIN products p ON p.product_id = s.product_id
        JOIN suppliers sup ON sup.supplier_id = p.supplier_id
        LEFT JOIN customers c ON c.customer_id = s.customer_id
        ORDER BY s.sale_date DESC, s.sale_id DESC
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
      const [rows] = await connection.execute('SELECT * FROM sales WHERE sale_id = ?', [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async create({ productId, customerId, saleDate, saleQty }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO sales (product_id, customer_id, sale_date, sale_qty)
         VALUES (?, ?, ?, ?)`,
        [productId, customerId, saleDate, saleQty]
      );
      return { sale_id: result.insertId };
    } finally {
      connection.release();
    }
  }

  static async update(id, { productId, customerId, saleDate, saleQty }) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE sales
         SET product_id = ?, customer_id = ?, sale_date = ?, sale_qty = ?
         WHERE sale_id = ?`,
        [productId, customerId, saleDate, saleQty, id]
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
      await connection.execute('DELETE FROM sales WHERE sale_id = ?', [id]);
      return { success: true };
    } finally {
      connection.release();
    }
  }

  // Available stock for a product = total purchased - total sold (optionally
  // excluding one sale row being edited).
  static async getAvailableStock(productId, excludeSaleId = null) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [purchasedRows] = await connection.execute(
        'SELECT COALESCE(SUM(quantity), 0) AS total FROM stock_purchases WHERE product_id = ?',
        [productId]
      );
      const purchased = Number(purchasedRows[0]?.total || 0);

      let soldQuery = 'SELECT COALESCE(SUM(sale_qty), 0) AS sold FROM sales WHERE product_id = ?';
      const params = [productId];
      if (excludeSaleId) {
        soldQuery += ' AND sale_id <> ?';
        params.push(excludeSaleId);
      }
      const [soldRows] = await connection.execute(soldQuery, params);
      return purchased - Number(soldRows[0]?.sold || 0);
    } finally {
      connection.release();
    }
  }
}

module.exports = Sale;
