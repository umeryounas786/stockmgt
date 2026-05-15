const Supplier = require('../models/Supplier');

exports.getSuppliersPage = (req, res) => {
  res.render('suppliers');
};

function parseBody(body) {
  return {
    code: (body.code || '').trim(),
    name: (body.name || '').trim(),
    contactPerson: (body.contactPerson || '').trim() || null,
    contactEmail: (body.contactEmail || '').trim() || null,
    contactPhone: (body.contactPhone || '').trim() || null,
    address: (body.address || '').trim() || null
  };
}

exports.getAll = async (req, res) => {
  try {
    const rows = await Supplier.getAll();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers' });
  }
};

exports.getById = async (req, res) => {
  try {
    const supplier = await Supplier.getById(req.params.id);
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ message: 'Error fetching supplier' });
  }
};

exports.create = async (req, res) => {
  try {
    const data = parseBody(req.body);
    if (!data.code) return res.status(400).json({ message: 'Supplier code is required' });
    if (!data.name) return res.status(400).json({ message: 'Supplier name is required' });

    const result = await Supplier.create(data);
    res.status(201).json({ message: 'Supplier created successfully', supplier: result });
  } catch (error) {
    console.error('Error creating supplier:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Supplier code already exists' });
    }
    res.status(500).json({ message: 'Error creating supplier' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = parseBody(req.body);
    if (!data.code) return res.status(400).json({ message: 'Supplier code is required' });
    if (!data.name) return res.status(400).json({ message: 'Supplier name is required' });

    const existing = await Supplier.getById(id);
    if (!existing) return res.status(404).json({ message: 'Supplier not found' });

    await Supplier.update(id, data);
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Error updating supplier:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Supplier code already exists' });
    }
    res.status(500).json({ message: 'Error updating supplier' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Supplier.getById(id);
    if (!existing) return res.status(404).json({ message: 'Supplier not found' });

    const count = await Supplier.getProductCount(id);
    if (count > 0) {
      return res.status(409).json({
        message: `Cannot delete supplier: it has ${count} product(s). Remove those first.`,
        inUse: true,
        productCount: count
      });
    }

    await Supplier.delete(id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Error deleting supplier' });
  }
};
