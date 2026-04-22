const { getPool } = require('../config/database');

class Category {
  static async getAll() {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const joinQuery = `
        SELECT c.*, COALESCE(s.cnt, 0) AS usage_count
        FROM categories c
        LEFT JOIN (
          SELECT category_id, COUNT(*) AS cnt
          FROM stock_items
          WHERE category_id IS NOT NULL
          GROUP BY category_id
        ) s ON s.category_id = c.category_id
        ORDER BY c.category_name ASC
      `;
      const [rows] = await connection.execute(joinQuery);
      return rows;
    } catch (joinErr) {
      // Fallback: schema may not have stock_items.category_id; return categories without usage info.
      console.warn('Category usage join failed, returning categories without usage_count:', joinErr.code || joinErr.message);
      const [rows] = await connection.execute('SELECT * FROM categories ORDER BY category_name ASC');
      return rows.map(r => ({ ...r, usage_count: null }));
    } finally {
      connection.release();
    }
  }

  static async getById(id) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();
      
      const query = 'SELECT * FROM categories WHERE category_id = ?';
      const [rows] = await connection.execute(query, [id]);
      
      connection.release();
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  static async create(categoryName, description = '') {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();
      
      const query = 'INSERT INTO categories (category_name, description) VALUES (?, ?)';
      const result = await connection.execute(query, [categoryName, description]);
      
      connection.release();
      return { category_id: result[0].insertId, categoryName, description };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  static async update(id, categoryName, description) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();
      
      const query = 'UPDATE categories SET category_name = ?, description = ?, updated_at = NOW() WHERE category_id = ?';
      await connection.execute(query, [categoryName, description, id]);
      
      connection.release();
      return { success: true, message: 'Category updated' };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const pool = await getPool();
      const connection = await pool.getConnection();

      const query = 'DELETE FROM categories WHERE category_id = ?';
      await connection.execute(query, [id]);

      connection.release();
      return { success: true, message: 'Category deleted' };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  static async getUsageCount(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT COUNT(*) AS cnt FROM stock_items WHERE category_id = ?',
        [id]
      );
      return rows[0] ? Number(rows[0].cnt) : 0;
    } catch (error) {
      // If stock_items / category_id column is missing, no FK refs by id can exist.
      console.warn('Category usage check failed, treating as 0 references:', error.code || error.message);
      return 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = Category;
