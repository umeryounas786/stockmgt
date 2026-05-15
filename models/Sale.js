const { getPool } = require('../config/database');

class Sale {
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(`
        SELECT s.*, p.product_description, p.company_id, c.company_code, c.company_name
        FROM sales s
        JOIN products p ON p.product_id = s.product_id
        JOIN company c ON c.company_id = p.company_id
        ORDER BY s.product_sale_date DESC, s.sale_id DESC
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

  static async getByProduct(productId) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM sales WHERE product_id = ? ORDER BY product_sale_date DESC, sale_id DESC',
        [productId]
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async create(productId, productCode, saleTo, saleDate, saleQty) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO sales (product_id, product_code, product_sale_to, product_sale_date, product_sale_qty)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, productCode, saleTo, saleDate, saleQty]
      );
      return { sale_id: result.insertId };
    } finally {
      connection.release();
    }
  }

  static async update(id, productId, productCode, saleTo, saleDate, saleQty) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE sales
         SET product_id = ?, product_code = ?, product_sale_to = ?,
             product_sale_date = ?, product_sale_qty = ?
         WHERE sale_id = ?`,
        [productId, productCode, saleTo, saleDate, saleQty, id]
      );
      return { success: true, message: 'Sale updated' };
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM sales WHERE sale_id = ?', [id]);
      return { success: true, message: 'Sale deleted' };
    } finally {
      connection.release();
    }
  }

  // Available stock for a product = purchase - already-sold (optionally excluding one sale row being edited).
  static async getAvailableStock(productId, excludeSaleId = null) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [prodRows] = await connection.execute(
        'SELECT product_stock_purchase FROM products WHERE product_id = ?',
        [productId]
      );
      if (!prodRows[0]) return null;

      let soldQuery = 'SELECT COALESCE(SUM(product_sale_qty), 0) AS sold FROM sales WHERE product_id = ?';
      const params = [productId];
      if (excludeSaleId) {
        soldQuery += ' AND sale_id <> ?';
        params.push(excludeSaleId);
      }
      const [soldRows] = await connection.execute(soldQuery, params);

      return Number(prodRows[0].product_stock_purchase) - Number(soldRows[0].sold);
    } finally {
      connection.release();
    }
  }
}

module.exports = Sale;
