const { getPool } = require('../config/database');
const { sendStockAlert } = require('../utils/emailService');

const SELECT_WITH_CATEGORY = `
  SELECT s.*, c.category_name
  FROM stock_items s
  LEFT JOIN categories c ON c.category_id = s.category_id
`;

class Stock {
  static async getAll() {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();

      const [rows] = await connection.execute(`${SELECT_WITH_CATEGORY} ORDER BY s.item_id DESC`);

      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();

      const [rows] = await connection.execute(`${SELECT_WITH_CATEGORY} WHERE s.item_id = ?`, [id]);

      connection.release();
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching stock item:', error);
      throw error;
    }
  }

  static async create(itemName, quantity, price, categoryId, description, sku = null, supplier = null) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();

      const query = `INSERT INTO stock_items (item_name, quantity, price, category_id, description, sku, supplier, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
      const result = await connection.execute(query, [itemName, quantity, price, categoryId, description, sku, supplier]);

      connection.release();
      return { item_id: result[0].insertId, itemName, quantity, price, categoryId };
    } catch (error) {
      console.error('Error creating stock item:', error);
      throw error;
    }
  }

  static async update(id, itemName, quantity, price, categoryId, description, sku = null, supplier = null) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();

      const query = `UPDATE stock_items
                     SET item_name = ?, quantity = ?, price = ?, category_id = ?, description = ?, sku = ?, supplier = ?, updated_at = NOW()
                     WHERE item_id = ?`;
      await connection.execute(query, [itemName, quantity, price, categoryId, description, sku, supplier, id]);

      connection.release();

      // Check if stock is below threshold and send alert
      if (quantity < parseInt(process.env.STOCK_ALERT_THRESHOLD)) {
        await sendStockAlert(itemName, quantity, id);
      }

      return { success: true, message: 'Stock item updated' };
    } catch (error) {
      console.error('Error updating stock item:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();

      const query = 'DELETE FROM stock_items WHERE item_id = ?';
      await connection.execute(query, [id]);

      connection.release();
      return { success: true, message: 'Stock item deleted' };
    } catch (error) {
      console.error('Error deleting stock item:', error);
      throw error;
    }
  }

  static async getLowStock() {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();
      const threshold = parseInt(process.env.STOCK_ALERT_THRESHOLD);

      const [rows] = await connection.execute(
        `${SELECT_WITH_CATEGORY} WHERE s.quantity <= ? ORDER BY s.quantity ASC`,
        [threshold]
      );

      connection.release();
      return rows;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }
}

module.exports = Stock;
