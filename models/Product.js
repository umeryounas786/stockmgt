const { getPool } = require('../config/database');

class Product {
  // Returns products with derived stock figures (total_purchase, total_sale,
  // stock_in_hand, stock_in_boxes) from product_stock_summary.
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

  // Next product code for a supplier: supplier_code prefix + an incrementing
  // number (e.g. 'acme' -> 'acme1', 'acme2'). The number is one past the
  // highest existing suffix so it survives deletions without reusing codes.
  static async generateProductCode(supplierId) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [supplierRows] = await connection.execute(
        'SELECT supplier_code FROM suppliers WHERE supplier_id = ?',
        [supplierId]
      );
      if (!supplierRows[0]) return null;
      const prefix = supplierRows[0].supplier_code;

      const [productRows] = await connection.execute(
        'SELECT product_code FROM products WHERE supplier_id = ?',
        [supplierId]
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

  static async create(supplierId, productCode, description, packetSize) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO products (supplier_id, product_code, product_description, product_packet_size)
         VALUES (?, ?, ?, ?)`,
        [supplierId, productCode, description, packetSize]
      );
      return { product_id: result.insertId, product_code: productCode };
    } finally {
      connection.release();
    }
  }

  static async update(id, description, packetSize) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE products
         SET product_description = ?, product_packet_size = ?, updated_at = NOW()
         WHERE product_id = ?`,
        [description, packetSize, id]
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
      await connection.execute('DELETE FROM products WHERE product_id = ?', [id]);
      return { success: true };
    } finally {
      connection.release();
    }
  }
}

module.exports = Product;
