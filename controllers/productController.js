const Product = require('../models/Product');
const Company = require('../models/Company');

exports.getProductsPage = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.render('dashboard', { products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).render('dashboard', { products: [] });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product' });
  }
};

function parseProductBody(body) {
  return {
    companyId: parseInt(body.companyId, 10),
    description: (body.description || '').trim(),
    packetSize: parseInt(body.packetSize, 10),
    stockPurchase: parseInt(body.stockPurchase, 10)
  };
}

function validateProductFields({ packetSize, stockPurchase }) {
  if (!Number.isInteger(packetSize) || packetSize < 1) {
    return 'Packet size must be a positive whole number';
  }
  if (!Number.isInteger(stockPurchase) || stockPurchase < 0) {
    return 'Stock purchase must be zero or a positive whole number';
  }
  return null;
}

// Preview of the code that createProduct would assign for a given company.
exports.getNextProductCode = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId, 10);
    if (!companyId) {
      return res.status(400).json({ message: 'Invalid company' });
    }

    const company = await Company.getById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const productCode = await Product.generateProductCode(companyId);
    res.json({ productCode });
  } catch (error) {
    console.error('Error generating product code:', error);
    res.status(500).json({ message: 'Error generating product code' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = parseProductBody(req.body);

    if (!data.companyId) {
      return res.status(400).json({ message: 'Company is required' });
    }
    const validationError = validateProductFields(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const company = await Company.getById(data.companyId);
    if (!company) {
      return res.status(400).json({ message: 'Selected company does not exist' });
    }

    // Product code is derived from the company code, not supplied by the client.
    const productCode = await Product.generateProductCode(data.companyId);

    const product = await Product.create(
      data.companyId, productCode, data.description, data.packetSize, data.stockPurchase
    );
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Product code already exists' });
    }
    res.status(500).json({ message: 'Error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = parseProductBody(req.body);

    const validationError = validateProductFields(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existing = await Product.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Lowering purchase below what has already been sold would make stock-in-hand negative.
    if (data.stockPurchase < existing.total_sale) {
      return res.status(400).json({
        message: `Stock purchase (${data.stockPurchase}) cannot be less than units already sold (${existing.total_sale})`
      });
    }

    // Company and product code are fixed once a product is created.
    await Product.update(
      id, existing.company_id, existing.product_code, data.description, data.packetSize, data.stockPurchase
    );
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Product.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.delete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};
