const Product = require('../models/Product');

exports.getProductsPage = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.render('dashboard', { products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).render('dashboard', { products: [] });
  }
};

exports.getAll = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

// Preview of the code that the system would assign for a given supplier.
exports.getNextProductCode = async (req, res) => {
  try {
    const supplierId = parseInt(req.params.supplierId, 10);
    if (!supplierId) return res.status(400).json({ message: 'Invalid supplier' });

    const code = await Product.generateProductCode(supplierId);
    if (code === null) return res.status(404).json({ message: 'Supplier not found' });

    res.json({ productCode: code });
  } catch (error) {
    console.error('Error generating product code:', error);
    res.status(500).json({ message: 'Error generating product code' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const description = (req.body.description || '').trim();
    const packetSize = parseInt(req.body.packetSize, 10);

    if (!Number.isInteger(packetSize) || packetSize < 1) {
      return res.status(400).json({ message: 'Packet size must be a positive whole number' });
    }

    const existing = await Product.getById(id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    await Product.update(id, description, packetSize);
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Product.getById(id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    await Product.delete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};
