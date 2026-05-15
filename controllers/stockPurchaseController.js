const StockPurchase = require('../models/StockPurchase');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');

const ALLOWED_CURRENCIES = ['USD', 'PKR', 'GBP'];

exports.getStockPurchasesPage = (req, res) => {
  res.render('stock-purchases');
};

function parseCreateBody(body) {
  return {
    supplierId: parseInt(body.supplierId, 10),
    description: (body.description || '').trim(),
    packetSize: parseInt(body.packetSize, 10),
    quantity: parseInt(body.quantity, 10),
    unitValue: Number.parseFloat(body.unitValue),
    currency: (body.currency || 'USD').toUpperCase(),
    purchaseDate: (body.purchaseDate || '').trim()
  };
}

function parseUpdateBody(body) {
  return {
    quantity: parseInt(body.quantity, 10),
    unitValue: Number.parseFloat(body.unitValue),
    currency: (body.currency || 'USD').toUpperCase(),
    purchaseDate: (body.purchaseDate || '').trim()
  };
}

function validatePurchaseFields(data) {
  if (!Number.isInteger(data.quantity) || data.quantity < 1) {
    return 'Quantity must be a positive whole number';
  }
  if (!Number.isFinite(data.unitValue) || data.unitValue < 0) {
    return 'Unit value must be zero or a positive number';
  }
  if (!ALLOWED_CURRENCIES.includes(data.currency)) {
    return `Currency must be one of: ${ALLOWED_CURRENCIES.join(', ')}`;
  }
  if (!data.purchaseDate) return 'Purchase date is required';
  return null;
}

exports.getAll = async (req, res) => {
  try {
    const rows = await StockPurchase.getAll();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching stock purchases:', error);
    res.status(500).json({ message: 'Error fetching stock purchases' });
  }
};

exports.getById = async (req, res) => {
  try {
    const row = await StockPurchase.getById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Stock purchase not found' });
    res.json(row);
  } catch (error) {
    console.error('Error fetching stock purchase:', error);
    res.status(500).json({ message: 'Error fetching stock purchase' });
  }
};

// Creating a stock purchase ALWAYS creates a new product whose code is derived
// from the selected supplier. The product description and packet size are
// captured at the same time and stored on the product row.
exports.create = async (req, res) => {
  try {
    const data = parseCreateBody(req.body);

    if (!data.supplierId) return res.status(400).json({ message: 'Supplier is required' });
    if (!Number.isInteger(data.packetSize) || data.packetSize < 1) {
      return res.status(400).json({ message: 'Pack size must be a positive whole number' });
    }
    const validationError = validatePurchaseFields(data);
    if (validationError) return res.status(400).json({ message: validationError });

    const supplier = await Supplier.getById(data.supplierId);
    if (!supplier) return res.status(400).json({ message: 'Selected supplier does not exist' });

    const productCode = await Product.generateProductCode(data.supplierId);
    const newProduct = await Product.create(
      data.supplierId, productCode, data.description, data.packetSize
    );

    const purchase = await StockPurchase.create({
      productId: newProduct.product_id,
      quantity: data.quantity,
      unitValue: data.unitValue,
      currency: data.currency,
      purchaseDate: data.purchaseDate
    });

    res.status(201).json({
      message: 'Stock purchase recorded successfully',
      product: newProduct,
      purchase
    });
  } catch (error) {
    console.error('Error creating stock purchase:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Generated product code clashed with an existing one. Please retry.' });
    }
    res.status(500).json({ message: 'Error creating stock purchase' });
  }
};

// Editing a stock purchase only changes financial / quantity fields. The
// product (and its supplier-derived code) stays put.
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = parseUpdateBody(req.body);

    const existing = await StockPurchase.getById(id);
    if (!existing) return res.status(404).json({ message: 'Stock purchase not found' });

    const validationError = validatePurchaseFields(data);
    if (validationError) return res.status(400).json({ message: validationError });

    // Make sure the new quantity doesn't drop the product's total purchased
    // below what's already been sold.
    const otherPurchased = await StockPurchase.getTotalPurchasedForProduct(existing.product_id, id);
    const projected = otherPurchased + data.quantity;
    const sold = await StockPurchase.getSoldForProduct(existing.product_id);
    if (projected < sold) {
      return res.status(400).json({
        message: `Updated quantity would drop total purchased (${projected}) below units already sold (${sold}).`
      });
    }

    await StockPurchase.update(id, data);
    res.json({ message: 'Stock purchase updated successfully' });
  } catch (error) {
    console.error('Error updating stock purchase:', error);
    res.status(500).json({ message: 'Error updating stock purchase' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await StockPurchase.getById(id);
    if (!existing) return res.status(404).json({ message: 'Stock purchase not found' });

    const otherPurchased = await StockPurchase.getTotalPurchasedForProduct(existing.product_id, id);
    const sold = await StockPurchase.getSoldForProduct(existing.product_id);
    if (otherPurchased < sold) {
      return res.status(400).json({
        message: `Cannot delete: removing this purchase would leave the product with ${otherPurchased} purchased vs ${sold} already sold.`
      });
    }

    await StockPurchase.delete(id);
    res.json({ message: 'Stock purchase deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock purchase:', error);
    res.status(500).json({ message: 'Error deleting stock purchase' });
  }
};
