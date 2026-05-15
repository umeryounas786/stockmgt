const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

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
    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ message: 'Error fetching sale' });
  }
};

function parseBody(body) {
  return {
    productId: parseInt(body.productId, 10),
    customerId: body.customerId ? parseInt(body.customerId, 10) : null,
    saleDate: (body.saleDate || '').trim(),
    saleQty: parseInt(body.saleQty, 10)
  };
}

function validate(data) {
  if (!data.productId) return 'Product is required';
  if (!data.saleDate) return 'Sale date is required';
  if (!Number.isInteger(data.saleQty) || data.saleQty < 1) {
    return 'Sale quantity must be a positive whole number';
  }
  return null;
}

exports.createSale = async (req, res) => {
  try {
    const data = parseBody(req.body);
    const validationError = validate(data);
    if (validationError) return res.status(400).json({ message: validationError });

    const product = await Product.getById(data.productId);
    if (!product) return res.status(400).json({ message: 'Selected product does not exist' });

    if (data.customerId) {
      const customer = await Customer.getById(data.customerId);
      if (!customer) return res.status(400).json({ message: 'Selected customer does not exist' });
    }

    const available = await Sale.getAvailableStock(data.productId);
    if (data.saleQty > available) {
      return res.status(400).json({
        message: `Sale quantity (${data.saleQty}) exceeds available stock (${available})`
      });
    }

    const sale = await Sale.create(data);
    res.status(201).json({ message: 'Sale recorded successfully', sale });
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Error recording sale' });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const data = parseBody(req.body);
    const validationError = validate(data);
    if (validationError) return res.status(400).json({ message: validationError });

    const existing = await Sale.getById(id);
    if (!existing) return res.status(404).json({ message: 'Sale not found' });

    const product = await Product.getById(data.productId);
    if (!product) return res.status(400).json({ message: 'Selected product does not exist' });

    if (data.customerId) {
      const customer = await Customer.getById(data.customerId);
      if (!customer) return res.status(400).json({ message: 'Selected customer does not exist' });
    }

    const available = await Sale.getAvailableStock(data.productId, id);
    if (data.saleQty > available) {
      return res.status(400).json({
        message: `Sale quantity (${data.saleQty}) exceeds available stock (${available})`
      });
    }

    await Sale.update(id, data);
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
    if (!existing) return res.status(404).json({ message: 'Sale not found' });

    await Sale.delete(id);
    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: 'Error deleting sale' });
  }
};
