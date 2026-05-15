const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.getSalesPage = (req, res) => {
  res.render('sales');
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.getAll();
    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ message: 'Error fetching sales' });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.getById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ message: 'Error fetching sale' });
  }
};

function parseSaleBody(body) {
  return {
    productId: parseInt(body.productId, 10),
    saleTo: (body.saleTo || '').trim() || null,
    saleDate: (body.saleDate || '').trim(),
    saleQty: parseInt(body.saleQty, 10)
  };
}

function validateSale({ productId, saleDate, saleQty }) {
  if (!productId) return 'Product is required';
  if (!saleDate) return 'Sale date is required';
  if (!Number.isInteger(saleQty) || saleQty < 1) {
    return 'Sale quantity must be a positive whole number';
  }
  return null;
}

exports.createSale = async (req, res) => {
  try {
    const data = parseSaleBody(req.body);
    const validationError = validateSale(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.getById(data.productId);
    if (!product) {
      return res.status(400).json({ message: 'Selected product does not exist' });
    }

    const available = await Sale.getAvailableStock(data.productId);
    if (data.saleQty > available) {
      return res.status(400).json({
        message: `Sale quantity (${data.saleQty}) exceeds available stock (${available})`
      });
    }

    const sale = await Sale.create(
      data.productId, product.product_code, data.saleTo, data.saleDate, data.saleQty
    );
    res.status(201).json({ message: 'Sale recorded successfully', sale });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Error recording sale' });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const data = parseSaleBody(req.body);
    const validationError = validateSale(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await Sale.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const product = await Product.getById(data.productId);
    if (!product) {
      return res.status(400).json({ message: 'Selected product does not exist' });
    }

    const available = await Sale.getAvailableStock(data.productId, id);
    if (data.saleQty > available) {
      return res.status(400).json({
        message: `Sale quantity (${data.saleQty}) exceeds available stock (${available})`
      });
    }

    await Sale.update(id, data.productId, product.product_code, data.saleTo, data.saleDate, data.saleQty);
    res.json({ message: 'Sale updated successfully' });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ message: 'Error updating sale' });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Sale.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    await Sale.delete(id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: 'Error deleting sale' });
  }
};
