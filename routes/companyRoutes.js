const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, checkAuth } = require('../middleware/auth');

// Web route
router.get('/companies', checkAuth, companyController.getCompaniesPage);

// API routes
router.get('/api/companies', authenticateToken, companyController.getAllCompanies);
router.get('/api/companies/:id', authenticateToken, companyController.getCompanyById);
router.post('/api/companies', authenticateToken, companyController.createCompany);
router.put('/api/companies/:id', authenticateToken, companyController.updateCompany);
router.delete('/api/companies/:id', authenticateToken, companyController.deleteCompany);

module.exports = router;
