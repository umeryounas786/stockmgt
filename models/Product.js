const { getPool } = require('../config/database');

class Product {
  // Returns products with derived stock figures (total_sale, stock_in_hand, stock_in_boxes).
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM product_stock_summary ORDER BY product_code ASC'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // Summary row for a single product (includes derived stock figures).
  static async getById(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM product_stock_summary WHERE product_id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Builds the next product code for a company: company_code prefix + an
  // incrementing number (e.g. 'sam' -> 'sam1', 'sam2'). The number is one past
  // the highest existing suffix so it survives deletions without reusing codes.
  static async generateProductCode(companyId) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [companyRows] = await connection.execute(
        'SELECT company_code FROM company WHERE company_id = ?',
        [companyId]
      );
      if (!companyRows[0]) return null;
      const prefix = companyRows[0].company_code;

      const [productRows] = await connection.execute(
        'SELECT product_code FROM products WHERE company_id = ?',
        [companyId]
      );

      let maxNum = 0;
      for (const row of productRows) {
        const code = row.product_code || '';
        if (code.startsWith(prefix)) {
          const num = parseInt(code.slice(prefix.length), 10);
          if (Number.isInteger(num) && num > maxNum) maxNum = num;
        }
      }
      return `${prefix}${maxNum + 1}`;
    } finally {
      connection.release();
    }
  }

  static async create(companyId, productCode, description, packetSize, stockPurchase) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO products (company_id, product_code, product_description, product_packet_size, product_stock_purchase)
         VALUES (?, ?, ?, ?, ?)`,
        [companyId, productCode, description, packetSize, stockPurchase]
      );
      return { product_id: result.insertId, product_code: productCode };
    } finally {
      connection.release();
    }
  }

  static async update(id, companyId, productCode, description, packetSize, stockPurchase) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE products
         SET company_id = ?, product_code = ?, product_description = ?,
             product_packet_size = ?, product_stock_purchase = ?, updated_at = NOW()
         WHERE product_id = ?`,
        [companyId, productCode, description, packetSize, stockPurchase, id]
      );
      return { success: true, message: 'Product updated' };
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute('DELETE FROM products WHERE product_id = ?', [id]);
      return { success: true, message: 'Product deleted' };
    } finally {
      connection.release();
    }
  }
}

module.exports = Product;
