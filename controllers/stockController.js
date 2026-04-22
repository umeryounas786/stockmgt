const Stock = require('../models/Stock');

exports.getAllStock = async (req, res) => {
  try {
    const items = await Stock.getAll();
    res.render('dashboard', { items, page: 'stock' });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).render('dashboard', { message: 'Error fetching stock items' });
  }
};

exports.getStockApiAll = async (req, res) => {
  try {
    const items = await Stock.getAll();
    res.json(items);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Error fetching stock items' });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Stock.getById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching stock item:', error);
    res.status(500).json({ message: 'Error fetching stock item' });
  }
};

exports.createStock = async (req, res) => {
  try {
    const { itemName, quantity, price, categoryId, description, sku, supplier } = req.body;

    if (!itemName || quantity === undefined || price === undefined || !categoryId) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const newItem = await Stock.create(itemName, quantity, price, categoryId, description, sku, supplier);
    res.status(201).json({ message: 'Stock item created successfully', item: newItem });
  } catch (error) {
    console.error('Error creating stock item:', error);
    res.status(500).json({ message: 'Error creating stock item' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, quantity, price, categoryId, description, sku, supplier } = req.body;

    if (!itemName || quantity === undefined || price === undefined || !categoryId) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    await Stock.update(id, itemName, quantity, price, categoryId, description, sku, supplier);
    res.json({ message: 'Stock item updated successfully' });
  } catch (error) {
    console.error('Error updating stock item:', error);
    res.status(500).json({ message: 'Error updating stock item' });
  }
};

exports.deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    await Stock.delete(id);
    res.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    res.status(500).json({ message: 'Error deleting stock item' });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const items = await Stock.getLowStock();
    res.json(items);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: 'Error fetching low stock items' });
  }
};
