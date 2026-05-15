const Company = require('../models/Company');

exports.getCompaniesPage = (req, res) => {
  res.render('companies');
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.getAll();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.getById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ message: 'Error fetching company' });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const companyCode = (req.body.companyCode || '').trim();
    const companyName = (req.body.companyName || '').trim();

    if (!companyCode || !companyName) {
      return res.status(400).json({ message: 'Company code and name are required' });
    }

    const company = await Company.create(companyCode, companyName);
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (error) {
    console.error('Error creating company:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Company code already exists' });
    }
    res.status(500).json({ message: 'Error creating company' });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const companyCode = (req.body.companyCode || '').trim();
    const companyName = (req.body.companyName || '').trim();

    if (!companyCode || !companyName) {
      return res.status(400).json({ message: 'Company code and name are required' });
    }

    const existing = await Company.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await Company.update(id, companyCode, companyName);
    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Error updating company:', error);
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Company code already exists' });
    }
    res.status(500).json({ message: 'Error updating company' });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await Company.getById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const productCount = await Company.getProductCount(id);
    if (productCount > 0) {
      return res.status(409).json({
        message: `Cannot delete company: it has ${productCount} product(s). Remove those products first.`,
        inUse: true,
        productCount
      });
    }

    await Company.delete(id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ message: 'Error deleting company' });
  }
};
