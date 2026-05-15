const Customer = require('../models/Customer');

exports.getCustomersPage = (req, res) => {
  res.render('customers');
};

function parseBody(body) {
  return {
    name: (body.name || '').trim(),
    contactPerson: (body.contactPerson || '').trim() || null,
    contactEmail: (body.contactEmail || '').trim() || null,
    contactPhone: (body.contactPhone || '').trim() || null,
    address: (body.address || '').trim() || null
  };
}

exports.getAll = async (req, res) => {
  try {
    const rows = await Customer.getAll();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

exports.getById = async (req, res) => {
  try {
    const customer = await Customer.getById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = parseBody(req.body);
    if (!data.name) return res.status(400).json({ message: 'Customer name is required' });

    const result = await Customer.create(data);
    res.status(201).json({ message: 'Customer created successfully', customer: result });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = parseBody(req.body);
    if (!data.name) return res.status(400).json({ message: 'Customer name is required' });

    const existing = await Customer.getById(id);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    await Customer.update(id, data);
    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Customer.getById(id);
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    // Sales referencing the customer keep their row via ON DELETE SET NULL,
    // so deletion is always allowed.
    await Customer.delete(id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
};
